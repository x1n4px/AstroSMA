// Visual export functionality that captures actual rendered content
import html2canvas from 'html2canvas';

/**
 * Visual exporter that captures the actual rendered content of widgets
 */
export class VisualExporter {
    constructor() {
        this.exportableSelectors = {
            'Title': '.exportable-content.title-text, .exportable-content.subtitle-text',
            'Description': '.exportable-content.description-text',
            'DataChart': '.exportable-content.chart-visual',
            'YouTubeVideo': '.exportable-content.video-embed',
            'Video': '.exportable-content.video-player',
            'Photo': '.exportable-content.photo-image',
            'ShowMeteors': '.exportable-content.meteor-table',
            'RunQuery': '.exportable-content.query-results',
            'InteractiveMap': '.exportable-content.map-visual'
        };
        
        // Widgets to exclude from all exports
        this.excludedWidgets = ['UploadVideoToYouTube', 'MeteorInput'];
    }

    /**
     * Capture visual content from a widget
     * @param {string} widgetType - Type of widget
     * @param {HTMLElement} widgetElement - Widget DOM element
     * @param {string} exportType - 'pdf' or 'wordpress'
     * @returns {Promise<Object>} - Captured content object
     */
    async captureWidgetContent(widgetType, widgetElement, exportType = 'pdf') {
        // Check if widget should be excluded
        if (this.excludedWidgets.includes(widgetType)) {
            return null;
        }
        
        if (!widgetElement || !this.exportableSelectors[widgetType]) {
            return null;
        }

        try {
            // Find exportable content within the widget
            const exportableElements = widgetElement.querySelectorAll(this.exportableSelectors[widgetType]);
            
            if (exportableElements.length === 0) {
                console.warn(`No exportable content found for ${widgetType}`);
                return null;
            }

            const capturedContent = [];

            for (const element of exportableElements) {
                const content = await this.captureElement(element, widgetType, exportType);
                if (content) {
                    capturedContent.push(content);
                }
            }

            return {
                type: widgetType,
                content: capturedContent
            };

        } catch (error) {
            console.error(`Error capturing content from ${widgetType}:`, error);
            return null;
        }
    }

    /**
     * Capture a single element's visual content
     * @param {HTMLElement} element - Element to capture
     * @param {string} widgetType - Type of widget
     * @param {string} exportType - Export type
     * @returns {Promise<Object>} - Captured content
     */
    async captureElement(element, widgetType, exportType) {
        try {
            // Apply clean styling for WordPress export (same as PDF)
            if (exportType === 'wordpress') {
                this.applyCleanStyling(element);
            }

            // For different widget types, we might want different capture strategies
            switch (widgetType) {
                case 'DataChart':
                    return await this.captureChart(element, exportType);
                
                case 'YouTubeVideo':
                    return await this.captureYouTubeVideo(element, exportType);
                
                case 'Video':
                    return await this.captureVideo(element, exportType);
                
                case 'Photo':
                    return await this.capturePhoto(element, exportType);
                
                default:
                    return await this.captureTextContent(element, exportType);
            }
        } catch (error) {
            console.error(`Error capturing element for ${widgetType}:`, error);
            return null;
        }
    }

    /**
     * Capture chart content (SVG or canvas)
     */
    async captureChart(element, exportType) {
        const svgElement = element.querySelector('svg');
        if (svgElement) {
            // For SVG charts, we can capture as SVG or convert to image
            if (exportType === 'wordpress') {
                // For WordPress, we can embed the SVG directly
                return {
                    type: 'chart',
                    format: 'svg',
                    content: svgElement.outerHTML,
                    title: element.querySelector('.chart-info strong')?.textContent || 'Chart'
                };
            } else {
                // For PDF, convert to image
                const canvas = await html2canvas(element, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    useCORS: true
                });
                return {
                    type: 'chart',
                    format: 'image',
                    content: canvas.toDataURL('image/png'),
                    title: element.querySelector('.chart-info strong')?.textContent || 'Chart'
                };
            }
        }
        return null;
    }

    /**
     * Capture YouTube video content
     */
    async captureYouTubeVideo(element, exportType) {
        const iframe = element.querySelector('iframe');
        const input = element.querySelector('input[type="text"]');
        const url = input ? input.value : '';
        
        if (exportType === 'pdf') {
            // For PDF, show as nicely formatted text link (video preview is hidden)
            if (url) {
                return {
                    type: 'youtube_link',
                    content: `🎥 YouTube Video: ${url}`,
                    url: url
                };
            } else {
                return {
                    type: 'youtube_link',
                    content: '🎥 YouTube Video: (No URL provided)',
                    url: ''
                };
            }
        } else {
            // For WordPress, return embed information (video preview is visible)
            const videoId = iframe ? this.extractVideoId(iframe.src) : '';
            return {
                type: 'youtube_embed',
                content: iframe ? iframe.outerHTML : '',
                videoId: videoId,
                url: url
            };
        }
    }

    /**
     * Capture video content
     */
    async captureVideo(element, exportType) {
        const video = element.querySelector('video');
        
        if (exportType === 'pdf') {
            return {
                type: 'video_placeholder',
                content: '[Video content - not included in PDF export]'
            };
        } else {
            return {
                type: 'video',
                content: video ? video.outerHTML : '<p>Video content would be displayed here</p>',
                hasVideo: !!video
            };
        }
    }

    /**
     * Capture photo content
     */
    async capturePhoto(element, exportType) {
        const img = element.querySelector('img');
        
        if (img && img.src) {
            return {
                type: 'photo',
                content: img.outerHTML,
                src: img.src,
                alt: img.alt || 'Uploaded image'
            };
        }
        
        return {
            type: 'photo',
            content: '<p>No image uploaded</p>',
            hasImage: false
        };
    }

    /**
     * Capture text content (titles, descriptions, etc.)
     */
    async captureTextContent(element, exportType) {
        const text = element.textContent || element.innerText || '';
        const html = element.innerHTML || '';
        
        if (exportType === 'pdf') {
            return {
                type: 'text',
                content: text.trim(),
                format: 'text'
            };
        } else {
            return {
                type: 'text',
                content: html,
                format: 'html'
            };
        }
    }

    /**
     * Apply clean styling to element for export (removes boxes, borders, etc.)
     * @param {HTMLElement} element - Element to style
     */
    applyCleanStyling(element) {
        // Find and style component boxes
        const componentBoxes = element.querySelectorAll('.component-box');
        componentBoxes.forEach(box => {
            box.style.background = 'transparent';
            box.style.border = 'none';
            box.style.padding = '0';
            box.style.marginBottom = '30px';
            box.style.boxShadow = 'none';
            box.style.borderRadius = '0';
        });

        // Find and style draggable components
        const draggableComponents = element.querySelectorAll('.draggable-component');
        draggableComponents.forEach(comp => {
            comp.style.background = 'transparent';
            comp.style.border = 'none';
            comp.style.padding = '0';
        });

        // Style specific content elements
        const titleTexts = element.querySelectorAll('.title-text');
        titleTexts.forEach(title => {
            title.style.fontSize = '2rem';
            title.style.fontWeight = 'bold';
            title.style.textAlign = 'center';
            title.style.margin = '0 0 10px 0';
            title.style.color = 'black';
        });

        const subtitleTexts = element.querySelectorAll('.subtitle-text');
        subtitleTexts.forEach(subtitle => {
            subtitle.style.fontSize = '1.2rem';
            subtitle.style.fontWeight = 'normal';
            subtitle.style.textAlign = 'center';
            subtitle.style.margin = '0 0 20px 0';
            subtitle.style.color = '#555';
        });

        const descriptionTexts = element.querySelectorAll('.description-text');
        descriptionTexts.forEach(desc => {
            desc.style.fontSize = '1rem';
            desc.style.lineHeight = '1.5';
            desc.style.color = 'black';
            desc.style.margin = '0 0 20px 0';
            desc.style.padding = '10px';
            desc.style.background = 'white';
            desc.style.border = '1px solid #ccc';
        });
    }

    /**
     * Extract video ID from YouTube iframe src
     */
    extractVideoId(src) {
        const match = src.match(/embed\/([^?]+)/);
        return match ? match[1] : '';
    }

    /**
     * Generate export content for all widgets
     * @param {Array} widgets - Array of widget objects
     * @param {string} exportType - 'pdf' or 'wordpress'
     * @returns {Promise<Array>} - Array of captured content
     */
    async generateVisualExport(widgets, exportType = 'pdf') {
        const results = [];
        
        // Filter out excluded widgets
        const filteredWidgets = widgets.filter(widget => !this.excludedWidgets.includes(widget.type));
        
        for (const widget of filteredWidgets) {
            const content = await this.captureWidgetContent(widget.type, widget.element, exportType);
            if (content) {
                results.push(content);
            }
        }
        
        return results;
    }

    /**
     * Generate HTML for WordPress export
     * @param {Array} exportContent - Array of captured content
     * @returns {string} - HTML string
     */
    generateWordPressHTML(exportContent) {
        let html = '<style>\n';
        html += '.meteor-report { font-family: Arial, sans-serif; line-height: 1.6; }\n';
        html += '.meteor-report .component-box { background: transparent !important; border: none !important; padding: 0 !important; margin-bottom: 30px !important; box-shadow: none !important; }\n';
        html += '.meteor-report .title-text { font-size: 2rem !important; font-weight: bold !important; text-align: center !important; margin: 0 0 10px 0 !important; color: black !important; }\n';
        html += '.meteor-report .subtitle-text { font-size: 1.2rem !important; font-weight: normal !important; text-align: center !important; margin: 0 0 20px 0 !important; color: #555 !important; }\n';
        html += '.meteor-report .description-text { font-size: 1rem !important; line-height: 1.5 !important; color: black !important; margin: 0 0 20px 0 !important; padding: 10px !important; background: white !important; border: 1px solid #ccc !important; }\n';
        html += '.meteor-report .chart-container { margin: 20px 0; text-align: center; }\n';
        html += '.meteor-report .youtube-container, .meteor-report .video-container, .meteor-report .photo-container { margin: 20px 0; text-align: center; }\n';
        html += '</style>\n';
        html += '<div class="meteor-report">\n';
        
        exportContent.forEach(widget => {
            html += `  <!-- ${widget.type} Widget -->\n`;
            widget.content.forEach(item => {
                switch (item.type) {
                    case 'text':
                        html += `  <div class="widget-content">\n`;
                        html += `    ${item.content}\n`;
                        html += `  </div>\n`;
                        break;
                    
                    case 'chart':
                        if (item.format === 'svg') {
                            html += `  <div class="chart-container">\n`;
                            html += `    <h3>${item.title}</h3>\n`;
                            html += `    ${item.content}\n`;
                            html += `  </div>\n`;
                        } else {
                            html += `  <div class="chart-container">\n`;
                            html += `    <h3>${item.title}</h3>\n`;
                            html += `    <img src="${item.content}" alt="${item.title}" style="max-width: 100%;" />\n`;
                            html += `  </div>\n`;
                        }
                        break;
                    
                    case 'youtube_embed':
                        html += `  <div class="youtube-container">\n`;
                        html += `    ${item.content}\n`;
                        html += `  </div>\n`;
                        break;
                    
                    case 'youtube_link':
                        html += `  <div class="youtube-link">\n`;
                        html += `    <p><a href="${item.url}" target="_blank">${item.content}</a></p>\n`;
                        html += `  </div>\n`;
                        break;
                    
                    case 'video':
                        html += `  <div class="video-container">\n`;
                        html += `    ${item.content}\n`;
                        html += `  </div>\n`;
                        break;
                    
                    case 'video_placeholder':
                        html += `  <div class="video-placeholder">\n`;
                        html += `    <p>${item.content}</p>\n`;
                        html += `  </div>\n`;
                        break;
                    
                    case 'photo':
                        html += `  <div class="photo-container">\n`;
                        html += `    ${item.content}\n`;
                        html += `  </div>\n`;
                        break;
                }
            });
            html += '\n';
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Generate content for PDF export
     * @param {Array} exportContent - Array of captured content
     * @returns {Object} - PDF content object
     */
    generatePDFContent(exportContent) {
        const content = {
            text: '',
            images: [],
            charts: []
        };
        
        exportContent.forEach(widget => {
            widget.content.forEach(item => {
                switch (item.type) {
                    case 'text':
                        content.text += item.content + '\n\n';
                        break;
                    
                    case 'chart':
                        if (item.format === 'image') {
                            content.charts.push({
                                title: item.title,
                                image: item.content
                            });
                        }
                        break;
                    
                    case 'youtube_link':
                        content.text += item.content + '\n\n';
                        break;
                    
                    case 'video_placeholder':
                        content.text += item.content + '\n\n';
                        break;
                    
                    case 'photo':
                        if (item.src) {
                            content.images.push({
                                src: item.src,
                                alt: item.alt
                            });
                        }
                        break;
                }
            });
        });
        
        return content;
    }
}

// Create singleton instance
export const visualExporter = new VisualExporter();
