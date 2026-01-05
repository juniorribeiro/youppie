"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import DragHandle from "@tiptap/extension-drag-handle";
import { ImageWithAlignment, ImageAlignment } from "./extensions/ImageWithAlignment";
import { useState, useCallback, useEffect } from "react";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    Upload,
    X,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Code,
    Type,
    Palette,
    ImagePlus,
    Trash2,
} from "lucide-react";
import { Button } from "@repo/ui";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Comece a escrever..." }: RichTextEditorProps) {
    const token = useAuthStore((state) => state.token);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showImageLibrary, setShowImageLibrary] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showSourceModal, setShowSourceModal] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showFontSizePicker, setShowFontSizePicker] = useState(false);
    const [sourceCode, setSourceCode] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [uploadedImages, setUploadedImages] = useState<Array<{ 
        url: string; 
        filename: string;
        width?: number;
        height?: number;
        size?: number;
        sizeFormatted?: string;
    }>>([]);
    const [uploading, setUploading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [selectionUpdate, setSelectionUpdate] = useState(0);
    const [isImageSelectedState, setIsImageSelectedState] = useState(false);
    const [currentImageAlignment, setCurrentImageAlignment] = useState<'left' | 'center' | 'right'>('center');

    const fontSizeOptions = ["8", "10", "12", "14", "16", "18", "20", "24", "28", "32", "36", "48", "72"];
    const colorOptions = [
        "#000000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#FFFFFF",
        "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899",
        "#F97316", "#84CC16", "#06B6D4", "#6366F1", "#A855F7", "#F43F5E",
    ];

    // Ensure component only renders on client side
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                link: false, // Disable default Link extension to use our custom configuration
            }),
            TextStyle,
            FontSize,
            Color,
            TextAlign.configure({
                types: ["heading", "paragraph"],
                defaultAlignment: "left",
            }),
            ImageWithAlignment.configure({
                inline: false,
                allowBase64: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary-600 underline hover:text-primary-700",
                },
            }),
            DragHandle,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: "",
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onSelectionUpdate: ({ editor }) => {
            // Force re-render when selection changes to update toolbar buttons
            setSelectionUpdate(prev => prev + 1);
            
            // Check if image is selected and update state
            const imageSelected = editor.isActive('image');
            setIsImageSelectedState(imageSelected);
            
            if (imageSelected) {
                const attrs = editor.getAttributes('image');
                setCurrentImageAlignment((attrs.align as ImageAlignment) || 'center');
            }
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none",
            },
        },
    });

    // Set initial content when mounted
    useEffect(() => {
        if (editor && isMounted && value) {
            editor.commands.setContent(value);
        }
    }, [editor, isMounted]);

    // Sync external value changes
    useEffect(() => {
        if (editor && isMounted && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor, isMounted]);

    // Close pickers when clicking outside
    useEffect(() => {
        if (!showFontSizePicker && !showColorPicker) {
            return;
        }
        
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-fontsize-picker]') && !target.closest('[data-color-picker]')) {
                setShowFontSizePicker(false);
                setShowColorPicker(false);
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showFontSizePicker, showColorPicker]);

    const handleImageUpload = useCallback(async (file: File) => {
        if (!token) return;
        
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003"}/uploads/image`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            editor?.chain().focus().setImage({ src: data.url } as any).updateAttributes('image', { align: 'center' }).run();
            setShowImageModal(false);
            setImageUrl("");
        } catch (error) {
            console.error("Upload error:", error);
            alert("Falha ao fazer upload da imagem");
        } finally {
            setUploading(false);
        }
    }, [editor, token]);

    const insertImageFromUrl = useCallback(() => {
        if (imageUrl && editor) {
            editor.chain().focus().setImage({ src: imageUrl } as any).updateAttributes('image', { align: 'center' }).run();
            setShowImageModal(false);
            setImageUrl("");
        }
    }, [editor, imageUrl]);

    const setLink = useCallback(() => {
        if (linkUrl && editor) {
            editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
            setShowLinkModal(false);
            setLinkUrl("");
        }
    }, [editor, linkUrl]);

    const removeLink = useCallback(() => {
        editor?.chain().focus().unsetLink().run();
        setShowLinkModal(false);
    }, [editor]);

    const handleOpenSource = useCallback(() => {
        if (editor) {
            setSourceCode(editor.getHTML());
            setShowSourceModal(true);
        }
    }, [editor]);

    const handleApplySource = useCallback(() => {
        if (editor) {
            try {
                editor.commands.setContent(sourceCode);
                onChange(sourceCode);
                setShowSourceModal(false);
            } catch (error) {
                console.error("Error applying source code:", error);
                alert("Erro ao aplicar código. Verifique se o HTML está válido.");
            }
        }
    }, [editor, sourceCode, onChange]);

    const loadUploadedImages = useCallback(async () => {
        if (!token) return;
        try {
            const images = await apiFetch<Array<{ 
                url: string; 
                filename: string;
                width?: number;
                height?: number;
                size?: number;
                sizeFormatted?: string;
            }>>("/uploads/images", { token });
            setUploadedImages(images);
        } catch (error) {
            console.error("Error loading images:", error);
        }
    }, [token]);

    const handleImageLibraryOpen = useCallback(() => {
        setShowImageLibrary(true);
        loadUploadedImages();
    }, [loadUploadedImages]);

    const insertImageFromLibrary = useCallback((url: string) => {
        if (editor) {
            editor.chain().focus().setImage({ src: url } as any).updateAttributes('image', { align: 'center' }).run();
            setShowImageLibrary(false);
        }
    }, [editor]);

    const handleDeleteImage = useCallback(async (filename: string, url: string) => {
        if (!token) return;
        
        if (!confirm('Tem certeza que deseja deletar esta imagem?')) {
            return;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003"}/uploads/delete/${encodeURIComponent(filename)}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Falha ao deletar imagem");
            }

            // Remove a imagem da lista
            setUploadedImages(prev => prev.filter(img => img.url !== url));
        } catch (error) {
            console.error("Delete error:", error);
            alert(error instanceof Error ? error.message : "Falha ao deletar imagem");
        }
    }, [token]);

    const handleSetFontSize = useCallback((size: string) => {
        if (!editor || !isMounted) return;
        
        try {
            editor.chain().focus().setFontSize(`${size}px`).run();
        } catch (error) {
            console.error('Error setting font size:', error);
        }
        setShowFontSizePicker(false);
    }, [editor, isMounted]);

    const handleSetColor = useCallback((color: string) => {
        if (!editor || !isMounted) return;
        
        try {
            editor.chain().focus().setColor(color).run();
        } catch (error) {
            console.error('Error setting color:', error);
        }
        setShowColorPicker(false);
    }, [editor, isMounted]);

    // Check if an image is selected
    const isImageSelected = useCallback(() => {
        if (!editor || !isMounted) return false;
        return editor.isActive('image');
    }, [editor, isMounted]);

    // Get current image alignment from the selected image
    const getCurrentImageAlignment = useCallback((): ImageAlignment => {
        if (!editor || !isMounted) return 'center';
        
        const attrs = editor.getAttributes('image');
        return (attrs.align as ImageAlignment) || 'center';
    }, [editor, isMounted]);

    // Align selected image
    const handleImageAlign = useCallback((alignment: ImageAlignment) => {
        if (!editor || !isMounted) return;
        
        try {
            editor.chain().focus().updateAttributes('image', { align: alignment }).run();
            setCurrentImageAlignment(alignment);
        } catch (error) {
            console.error('Error aligning image:', error);
        }
    }, [editor, isMounted]);


    if (!isMounted || !editor) {
        return (
            <div className="border rounded-xl bg-white animate-pulse">
                <div className="h-12 bg-gray-100 rounded-t-xl"></div>
                <div className="h-[200px] p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                    title="Negrito"
                >
                    <Bold className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                    title="Itálico"
                >
                    <Italic className="h-4 w-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive("heading", { level: 1 })}
                    title="Título 1"
                >
                    <Heading1 className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive("heading", { level: 2 })}
                    title="Título 2"
                >
                    <Heading2 className="h-4 w-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <ToolbarButton
                    onClick={() => {
                        if (isImageSelectedState) {
                            handleImageAlign('left');
                        } else {
                            editor.chain().focus().setTextAlign("left").run();
                        }
                    }}
                    isActive={isImageSelectedState ? currentImageAlignment === 'left' : editor.isActive({ textAlign: "left" })}
                    title={isImageSelectedState ? "Alinhar Imagem à Esquerda" : "Alinhar à Esquerda"}
                >
                    <AlignLeft className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => {
                        if (isImageSelectedState) {
                            handleImageAlign('center');
                        } else {
                            editor.chain().focus().setTextAlign("center").run();
                        }
                    }}
                    isActive={isImageSelectedState ? currentImageAlignment === 'center' : editor.isActive({ textAlign: "center" })}
                    title={isImageSelectedState ? "Centralizar Imagem" : "Centralizar"}
                >
                    <AlignCenter className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => {
                        if (isImageSelectedState) {
                            handleImageAlign('right');
                        } else {
                            editor.chain().focus().setTextAlign("right").run();
                        }
                    }}
                    isActive={isImageSelectedState ? currentImageAlignment === 'right' : editor.isActive({ textAlign: "right" })}
                    title={isImageSelectedState ? "Alinhar Imagem à Direita" : "Alinhar à Direita"}
                >
                    <AlignRight className="h-4 w-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Font Size Picker */}
                <div className="relative" data-fontsize-picker>
                    <ToolbarButton
                        onClick={() => {
                            setShowFontSizePicker(!showFontSizePicker);
                        }}
                        title="Tamanho da Fonte"
                    >
                        <Type className="h-4 w-4" />
                    </ToolbarButton>
                    {showFontSizePicker && (
                        <div 
                            className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-48 max-h-64 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                            data-fontsize-picker
                        >
                            <div className="p-1">
                                {fontSizeOptions.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSetFontSize(size);
                                        }}
                                        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 rounded transition-colors"
                                    >
                                        {size}px
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Color Picker */}
                <div className="relative" data-color-picker>
                    <ToolbarButton
                        onClick={() => {
                            setShowColorPicker(!showColorPicker);
                        }}
                        title="Cor do Texto"
                    >
                        <Palette className="h-4 w-4" />
                    </ToolbarButton>
                    {showColorPicker && (
                        <div 
                            className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-48 p-3"
                            onClick={(e) => e.stopPropagation()}
                            data-color-picker
                        >
                            <div className="grid grid-cols-6 gap-2 mb-3">
                                {colorOptions.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSetColor(color);
                                        }}
                                        className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform hover:border-gray-400"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                            <div className="border-t border-gray-200 pt-3">
                                <label className="block text-xs text-gray-600 mb-1">Cor personalizada</label>
                                <input
                                    type="color"
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        handleSetColor(e.target.value);
                                    }}
                                    className="w-full h-8 cursor-pointer rounded"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive("bulletList")}
                    title="Lista"
                >
                    <List className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive("orderedList")}
                    title="Lista Numerada"
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <ToolbarButton
                    onClick={() => setShowLinkModal(true)}
                    isActive={editor.isActive("link")}
                    title="Link"
                >
                    <LinkIcon className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => setShowImageModal(true)}
                    title="Upload Imagem"
                >
                    <ImageIcon className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={handleImageLibraryOpen}
                    title="Biblioteca de Imagens"
                >
                    <ImagePlus className="h-4 w-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <ToolbarButton
                    onClick={handleOpenSource}
                    title="Editar Código Fonte"
                >
                    <Code className="h-4 w-4" />
                </ToolbarButton>

                <div className="flex-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Desfazer"
                >
                    <Undo className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Refazer"
                >
                    <Redo className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />

            {/* Source Code Modal */}
            {showSourceModal && (
                <Modal onClose={() => setShowSourceModal(false)} title="Editar Código Fonte HTML">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Código HTML</label>
                            <textarea
                                value={sourceCode}
                                onChange={(e) => setSourceCode(e.target.value)}
                                placeholder="Cole ou edite o código HTML aqui..."
                                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                                spellCheck={false}
                            />
                            <p className="text-xs text-gray-500">
                                Edite o código HTML diretamente. Clique em "Aplicar" para atualizar o editor.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowSourceModal(false)}>
                                Cancelar
                            </Button>
                            <Button variant="primary" onClick={handleApplySource}>
                                Aplicar
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Image Library Modal */}
            {showImageLibrary && (
                <Modal onClose={() => setShowImageLibrary(false)} title="Biblioteca de Imagens">
                    <div className="space-y-4">
                        {uploadedImages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <ImagePlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>Nenhuma imagem encontrada.</p>
                                <p className="text-sm">Faça upload de imagens para vê-las aqui.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                                {uploadedImages.map((image) => {
                                    // Format dimensions
                                    const hasDimensions = image.width && image.height && image.width > 0 && image.height > 0;
                                    const dimensions = hasDimensions ? `${image.width} × ${image.height} px` : null;
                                    
                                    // Format size - try multiple sources
                                    let size: string | null = null;
                                    if (image.sizeFormatted) {
                                        size = image.sizeFormatted;
                                    } else if (image.size && image.size > 0) {
                                        if (image.size < 1024) {
                                            size = `${image.size} B`;
                                        } else if (image.size < 1024 * 1024) {
                                            size = `${(image.size / 1024).toFixed(2)} KB`;
                                        } else {
                                            size = `${(image.size / (1024 * 1024)).toFixed(2)} MB`;
                                        }
                                    }
                                    
                                    const tooltipText = `${image.filename}${dimensions ? `\n${dimensions}` : ''}${size ? `\n${size}` : ''}`;
                                    
                                    return (
                                        <div 
                                            key={image.url} 
                                            className="group relative"
                                            title={tooltipText}
                                        >
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => insertImageFromLibrary(image.url)}
                                                    className="w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-500 transition-colors relative"
                                                >
                                                    <img
                                                        src={image.url}
                                                        alt={image.filename}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <div className="text-white text-xs font-medium text-center px-2">
                                                            Clique para inserir
                                                        </div>
                                                    </div>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteImage(image.filename, image.url);
                                                    }}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg z-10"
                                                    title="Deletar imagem"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="mt-2 space-y-1 min-h-[40px]">
                                                {dimensions ? (
                                                    <div className="text-sm font-semibold text-gray-700 text-center">
                                                        {dimensions}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-400 text-center italic">
                                                        Dimensões não disponíveis
                                                    </div>
                                                )}
                                                {size ? (
                                                    <div className="text-xs text-gray-500 text-center">
                                                        {size}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-400 text-center italic">
                                                        Tamanho não disponível
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={() => setShowImageLibrary(false)}>
                                Fechar
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Image Modal */}
            {showImageModal && (
                <Modal onClose={() => setShowImageModal(false)} title="Inserir Imagem">
                    <div className="space-y-4">
                        {/* Upload */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file);
                                }}
                                className="hidden"
                                id="image-upload"
                            />
                            <label htmlFor="image-upload" className="cursor-pointer">
                                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">
                                    {uploading ? "Enviando..." : "Clique para fazer upload"}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF ou WebP até 5MB</p>
                            </label>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">ou</span>
                            </div>
                        </div>

                        {/* URL */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">URL da Imagem</label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://exemplo.com/imagem.jpg"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowImageModal(false)}>
                                Cancelar
                            </Button>
                            <Button variant="primary" onClick={insertImageFromUrl} disabled={!imageUrl}>
                                Inserir
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Link Modal */}
            {showLinkModal && (
                <Modal onClose={() => setShowLinkModal(false)} title="Inserir Link">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">URL</label>
                            <input
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://exemplo.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            {editor.isActive("link") && (
                                <Button variant="outline" onClick={removeLink} className="mr-auto text-red-600">
                                    Remover Link
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => setShowLinkModal(false)}>
                                Cancelar
                            </Button>
                            <Button variant="primary" onClick={setLink} disabled={!linkUrl}>
                                {editor.isActive("link") ? "Atualizar" : "Inserir"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// Toolbar Button Component
function ToolbarButton({
    onClick,
    isActive,
    disabled,
    title,
    children,
}: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-2 rounded-lg transition-colors ${
                isActive
                    ? "bg-primary-100 text-primary-700"
                    : disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
        >
            {children}
        </button>
    );
}

// Modal Component
function Modal({
    onClose,
    title,
    children,
}: {
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

