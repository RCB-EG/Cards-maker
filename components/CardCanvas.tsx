import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { CardRarity, RapperCardData, RarityConfig, CardRarityValues } from '../types';

interface CardCanvasProps {
  data: RapperCardData;
  rarityConfigs: RarityConfig[];
  width?: number;
  height?: number;
}

export interface CardCanvasHandle {
  download: () => void;
}

const LARGE_ICON_IDS = ['showmaker', 'artist', 'story', 'career', 'chopper'];
const EXPORT_SCALE = 3; // 3x Resolution for high quality

const CardCanvas = forwardRef<CardCanvasHandle, CardCanvasProps>(({ data, rarityConfigs, width = 400, height = 600 }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const [assets, setAssets] = useState<{
    bgImg: HTMLImageElement | null;
    bgVideo: HTMLVideoElement | null;
    rapperImg: HTMLImageElement | null;
    spIcons: Record<string, HTMLImageElement>;
  }>({ bgImg: null, bgVideo: null, rapperImg: null, spIcons: {} });

  /**
   * Helper to load an image safely.
   */
  const loadImage = (src: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        resolve(null);
      };
      img.src = src;
    });
  };

  const spIds = data.superpowers.map(sp => sp.id).join(',');

  useEffect(() => {
    let isMounted = true;
    const loadAssets = async () => {
      const newAssets: any = { bgImg: null, bgVideo: null, rapperImg: null, spIcons: {} };

      // Load background
      const activeConfig = rarityConfigs.find(c => c.id === data.rarity) || rarityConfigs[0];
      const videoUrl = activeConfig?.videoUrl;
      if (videoUrl) {
        const video = document.createElement('video');
        video.crossOrigin = "anonymous";
        video.src = videoUrl;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        await new Promise((resolve) => {
          video.onloadeddata = resolve;
          video.onerror = resolve;
          video.load();
        });
        newAssets.bgVideo = video;
        videoRef.current = video;
        video.play().catch(e => console.error("Video play failed", e));
      } else {
        const bgUrl = activeConfig?.imageUrl || '';
        newAssets.bgImg = await loadImage(bgUrl);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current = null;
        }
      }

      // Load rapper image
      if (data.image) {
        newAssets.rapperImg = await loadImage(data.image);
      }

      // Load superpowers
      for (const sp of data.superpowers) {
        const img = await loadImage(sp.iconUrl);
        if (img) newAssets.spIcons[sp.id] = img;
      }

      if (isMounted) {
        setAssets(newAssets);
      }
    };

    loadAssets();

    return () => {
      isMounted = false;
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current = null;
      }
    };
  }, [data.rarity, data.image, spIds]);

  /**
   * Helper to create the outer Card shape path.
   */
  const createCardPath = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.beginPath();
    const radius = 24;
    
    // Top Left Corner
    ctx.moveTo(radius, 0);
    ctx.lineTo(w - radius, 0);
    // Top Right Corner
    ctx.quadraticCurveTo(w, 0, w, radius);
    
    // Right Side to Bottom Point
    ctx.lineTo(w, h * 0.75); 
    // Shield Curve to tip
    ctx.bezierCurveTo(w, h * 0.9, w * 0.5, h * 0.96, w * 0.5, h); 
    ctx.bezierCurveTo(w * 0.5, h * 0.96, 0, h * 0.9, 0, h * 0.75); 
    
    // Left Side to Top
    ctx.lineTo(0, radius);
    // Top Left Corner
    ctx.quadraticCurveTo(0, 0, radius, 0);
    
    ctx.closePath();
  };

  const drawFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- High DPI Setup ---
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(EXPORT_SCALE, EXPORT_SCALE);

    // Clear (using logical dimensions)
    ctx.clearRect(0, 0, width, height);

    // --- Determine Colors based on Rarity ---
    let textColorName = '#0a0a0a';       
    let textColorStatsLabel = '#5c4d3c'; 
    let textColorStatsValue = '#0a0a0a'; 
    let textColorOvr = '#F5E6C8';        

    switch (data.rarity) {
      case CardRarityValues.BRONZE:
        textColorName = textColorOvr;
        textColorStatsLabel = textColorOvr;
        textColorStatsValue = textColorOvr;
        break;
      case CardRarityValues.SILVER:
        textColorOvr = '#FFFFFF';
        break;
      case CardRarityValues.ROTM:
        const cyan = '#00FFFF';
        textColorName = cyan;
        textColorStatsLabel = cyan;
        textColorStatsValue = cyan;
        textColorOvr = cyan;
        break;
      case CardRarityValues.ICON:
        textColorOvr = '#000000';
        break;
      case CardRarityValues.ROTY:
      case CardRarityValues.ROTY_ANIMATED:
         textColorName = '#FFFFFF';
         textColorStatsLabel = '#FFFFFF';
         textColorStatsValue = '#FFFFFF';
         textColorOvr = '#FFFFFF';
         break;
      case CardRarityValues.ROTY_ICON:
         textColorName = '#000000';
         textColorStatsLabel = '#000000';
         textColorStatsValue = '#000000';
         textColorOvr = '#000000';
         break;
      case CardRarityValues.FIGHTERS:
         const fightersGold = '#F5E6C8';
         textColorName = fightersGold;
         textColorStatsLabel = fightersGold;
         textColorStatsValue = fightersGold;
         textColorOvr = fightersGold;
         break;
      case CardRarityValues.WATN:
         const watnGold = '#FFD700';
         textColorName = watnGold;
         textColorStatsLabel = watnGold;
         textColorStatsValue = watnGold;
         textColorOvr = watnGold;
         break;
      case CardRarityValues.HERO:
         const heroGold = '#FFD700';
         textColorName = heroGold;
         textColorStatsLabel = heroGold;
         textColorStatsValue = heroGold;
         textColorOvr = heroGold;
         break;
      default:
        break;
    }

    // Apply custom rarity color overrides if provided
    const activeConfig = rarityConfigs.find(c => c.id === data.rarity);
    if (activeConfig) {
      if (activeConfig.textColorName) textColorName = activeConfig.textColorName;
      if (activeConfig.textColorStatsLabel) textColorStatsLabel = activeConfig.textColorStatsLabel;
      if (activeConfig.textColorStatsValue) textColorStatsValue = activeConfig.textColorStatsValue;
      if (activeConfig.textColorOvr) textColorOvr = activeConfig.textColorOvr;
    }

    // --- 2. Clipping & Composition ---
    ctx.save(); 
    
    createCardPath(ctx, width, height);
    ctx.clip(); 

    // Draw the template background first
    if (assets.bgVideo) {
       const video = assets.bgVideo;
       const vW = video.videoWidth || width;
       const vH = video.videoHeight || height;
       
       let drawW, drawH, drawX, drawY;
       
       if (data.rarity === CardRarityValues.ROTY_ANIMATED) {
           // Reverting to a much more subtle non-uniform scale closer to the 1.44 uniform scale
           const baseScale = Math.max(width / vW, height / vH);
           const scaleX = baseScale * 1.38; // Slightly less wide than 1.44
           const scaleY = baseScale * 1.48; // Slightly taller than 1.44
           
           drawW = vW * scaleX;
           drawH = vH * scaleY;
           
           // Moderate shift up and left (adjusted further down and right)
           drawX = (width - drawW) / 2 + 4;
           drawY = (height - drawH) / 2 - 14;
       } else {
           // Preserve aspect ratio (cover) for other potential videos
           const scale = Math.max(width / vW, height / vH);
           drawW = vW * scale;
           drawH = vH * scale;
           drawX = (width - drawW) / 2;
           drawY = (height - drawH) / 2;
       }
       
       ctx.drawImage(video, drawX, drawY, drawW, drawH);
    } else if (assets.bgImg) {
       ctx.drawImage(assets.bgImg, 0, 0, width, height);
    } else {
       ctx.fillStyle = '#222';
       ctx.fillRect(0, 0, width, height);
    }

    // --- 3. Rapper Image ---
    if (assets.rapperImg) {
      const img = assets.rapperImg;
      const { x, y, scale } = data.imagePosition;
      const imgW = img.naturalWidth * scale;
      const imgH = img.naturalHeight * scale;
      const centerX = width / 2 + x;
      const centerY = (height * 0.45) + y; 
      
      ctx.save(); 
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      
      const plateSideY = height * 0.62; 
      const plateCenterY = height * 0.65; 
      
      ctx.lineTo(width, plateSideY);
      ctx.quadraticCurveTo(width / 2, plateCenterY, 0, plateSideY);
      
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.clip();
      
      ctx.drawImage(img, centerX - imgW / 2, centerY - imgH / 2, imgW, imgH);
      
      ctx.restore(); 
    }

    // --- 4. Superpowers ---
    if (data.superpowers && data.superpowers.length > 0) {
        const iconSize = 55; 
        const xCenter = 40; 
        const gap = 8;
        
        const containerCenterY = 320;
        const totalHeight = (data.superpowers.length * iconSize) + ((data.superpowers.length - 1) * gap);
        let currentY = containerCenterY - (totalHeight / 2);

        for (let i = 0; i < data.superpowers.length; i++) {
            const sp = data.superpowers[i];
            const img = assets.spIcons[sp.id];
            
            if (img) {
                let scale = Math.min(iconSize / img.naturalWidth, iconSize / img.naturalHeight);
                if (!LARGE_ICON_IDS.includes(sp.id)) {
                    scale *= 1.25; 
                }

                const w = img.naturalWidth * scale;
                const h = img.naturalHeight * scale;
                
                const xPos = xCenter - (w / 2);
                const yPos = currentY + (iconSize - h) / 2;
                
                ctx.save();
                ctx.drawImage(img, xPos, yPos, w, h);
                ctx.restore();
                
                currentY += iconSize + gap;
            }
        }
    }

    // --- 5. Text & Stats ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic'; 
    ctx.font = '400 38.5px Oswald'; 
    
    const nameY = height * 0.725; 

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    if (data.rarity === CardRarityValues.ROTY || data.rarity === CardRarityValues.ROTY_ANIMATED) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    } else if (data.rarity === CardRarityValues.ROTY_ICON) {
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 50; 
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    } else if (data.rarity === CardRarityValues.FIGHTERS) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    } else if (data.rarity === CardRarityValues.WATN) {
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    } else if (data.rarity === CardRarityValues.HERO) {
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    ctx.fillStyle = textColorName; 
    ctx.fillText(data.name.toUpperCase(), width / 2, nameY);

    const statLabels = [
        { key: 'lyricism', label: 'LYRC' },
        { key: 'flow', label: 'FLOW' },
        { key: 'sing', label: 'SING' },
        { key: 'live', label: 'LIVE' },
        { key: 'diss', label: 'DISS' },
        { key: 'charisma', label: 'CHAR' }
    ];
    
    const labelsY = height * 0.77; 
    const valuesY = height * 0.81; 
    
    const center = width / 2;
    const step1 = 25;
    const step2 = 75;
    const step3 = 125;
    
    const xPositions = [
        center - step3, 
        center - step2, 
        center - step1, 
        center + step1, 
        center + step2, 
        center + step3  
    ];

    statLabels.forEach((item, index) => {
        const x = xPositions[index];
        
        const labelWeight = data.rarity === CardRarityValues.ROTY_ICON ? '700' : '500';
        ctx.font = `${labelWeight} 12px Oswald`; 
        ctx.fillStyle = textColorStatsLabel;
        ctx.textAlign = 'center';

        if (data.rarity === CardRarityValues.ROTY_ICON) {
            ctx.lineWidth = 3; 
            ctx.strokeStyle = '#FFFFFF';
            ctx.strokeText(item.label, x, labelsY);
        }

        ctx.fillText(item.label, x, labelsY);
        
        const valWeight = data.rarity === CardRarityValues.ROTY_ICON ? '700' : '400';
        ctx.font = `${valWeight} 22px Oswald`; 
        const valStr = data.stats[item.key as keyof typeof data.stats].toString();
        ctx.fillStyle = textColorStatsValue;
        ctx.fillText(valStr, x, valuesY);
    });

    ctx.restore(); 

    // --- 6. OVR Rating (Top Left) ---
    const ovrX = 88; 
    const ovrY = 172; 
    
    ctx.save();
    ctx.font = 'bold 60px Oswald'; 
    ctx.textAlign = 'center';

    ctx.fillStyle = textColorOvr;
    
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    if (data.rarity === CardRarityValues.ROTY_ICON) {
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 50; 
    } else if (data.rarity === CardRarityValues.ROTY || data.rarity === CardRarityValues.ROTY_ANIMATED) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    } else if (data.rarity === CardRarityValues.ICON) {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
    } else if (data.rarity === CardRarityValues.FIGHTERS) {
         ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
         ctx.shadowBlur = 4;
         ctx.shadowOffsetX = 2;
         ctx.shadowOffsetY = 2;
    } else if (data.rarity === CardRarityValues.WATN) {
         ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
         ctx.shadowBlur = 10;
    } else if (data.rarity === CardRarityValues.HERO) {
         ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
         ctx.shadowBlur = 10;
    } else {
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
    }

    ctx.fillText(data.stats.ovr.toString(), ovrX, ovrY);
    
    ctx.restore();
  };

  useEffect(() => {
    let animationId: number;
    
    const renderLoop = () => {
      drawFrame();
      if (assets.bgVideo) {
        animationId = requestAnimationFrame(renderLoop);
      }
    };

    if (assets.bgVideo) {
      renderLoop();
    } else {
      drawFrame();
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [assets, data, width, height]);

  useImperativeHandle(ref, () => ({
    download: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const sanitize = (str: string) => str.trim().replace(/[\s\/\\:*?"<>|]+/g, '_');
      
      const namePart = sanitize(data.name) || 'Untitled';
      const rarityPart = data.rarity;
      const ovrPart = data.stats.ovr;
      const powersPart = data.superpowers.map(sp => sanitize(sp.name)).join('_');
      
      let filename = `${namePart}_${rarityPart}_${ovrPart}`;
      if (powersPart) {
        filename += `_${powersPart}`;
      }
      
      if (assets.bgVideo) {
        // Record video for animated cards
        setIsRecording(true);
        filename += '.webm';
        
        // Use 30fps stream
        const stream = canvas.captureStream(30);
        
        // Try to use vp8 for better transparency support in webm
        let options = { mimeType: 'video/webm; codecs=vp8' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: 'video/webm' };
        }
        
        const recorder = new MediaRecorder(stream, options);
        const chunks: BlobPart[] = [];
        
        recorder.ondataavailable = e => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: options.mimeType });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = filename;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          setIsRecording(false);
        };
        
        recorder.start();
        
        // Record for 4 seconds (typical loop duration)
        setTimeout(() => {
          recorder.stop();
        }, 4000);
      } else {
        // Static image download
        filename += '.webp';
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/webp');
        link.click();
      }
    }
  }));

  return (
    <div className="relative shadow-2xl rounded-[30px] overflow-hidden" style={{ width, height }}>
      <canvas 
        ref={canvasRef} 
        width={width * EXPORT_SCALE} 
        height={height * EXPORT_SCALE}
        style={{ width, height }} 
        className="bg-transparent"
      />
      {isRecording && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-50">
          <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full mb-3"></div>
          <p className="text-white font-bold animate-pulse">Recording Video...</p>
        </div>
      )}
    </div>
  );
});

CardCanvas.displayName = 'CardCanvas';

export default CardCanvas;