import Image from '@tiptap/extension-image';
import type { SingleCommands } from '@tiptap/core';

export type ImageAlignment = 'left' | 'center' | 'right';

declare module '@tiptap/extension-image' {
    interface ImageOptions {
        alignments: ImageAlignment[];
    }
}

export const ImageWithAlignment = Image.extend({
    name: 'image',

    addAttributes() {
        return {
            ...this.parent?.(),
            align: {
                default: 'center',
                parseHTML: (element) => {
                    // Try to get alignment from style
                    const style = element.getAttribute('style') || '';
                    
                    // Check for margin-based centering
                    if (style.includes('margin-left: auto') && style.includes('margin-right: auto')) {
                        return 'center';
                    }
                    
                    // Check for float
                    if (style.includes('float: left')) {
                        return 'left';
                    }
                    if (style.includes('float: right')) {
                        return 'right';
                    }

                    // Check data attribute
                    const dataAlign = element.getAttribute('data-align');
                    if (dataAlign) {
                        return dataAlign;
                    }

                    // Check parent div alignment
                    const parent = element.parentElement;
                    if (parent && parent.tagName === 'DIV') {
                        const parentStyle = parent.getAttribute('style') || '';
                        if (parentStyle.includes('text-align: center')) {
                            return 'center';
                        }
                        if (parentStyle.includes('text-align: left')) {
                            return 'left';
                        }
                        if (parentStyle.includes('text-align: right')) {
                            return 'right';
                        }
                    }

                    return 'center';
                },
                renderHTML: (attributes) => {
                    const align = attributes.align as ImageAlignment || 'center';
                    
                    let style = 'max-width: 100%; height: auto; border-radius: 0.5rem; margin-top: 1rem; margin-bottom: 1rem; ';
                    
                    switch (align) {
                        case 'left':
                            style += 'display: block; margin-left: 0; margin-right: auto;';
                            break;
                        case 'right':
                            style += 'display: block; margin-left: auto; margin-right: 0;';
                            break;
                        case 'center':
                        default:
                            style += 'display: block; margin-left: auto; margin-right: auto;';
                            break;
                    }

                    return {
                        style,
                        'data-align': align,
                    };
                },
            },
        };
    },

    addCommands() {
        return {
            ...this.parent?.(),
            setImageAlign:
                (align: ImageAlignment) =>
                ({ commands }: { commands: SingleCommands }) => {
                    return commands.updateAttributes('image', { align });
                },
        };
    },
});

export default ImageWithAlignment;

