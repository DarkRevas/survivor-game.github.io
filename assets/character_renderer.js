/**
 * Shadow Survivor - Character Sprite Renderer
 * Handles SVG asset loading and rendering for hero and monsters
 * 
 * Features:
 * - Preloads all SVG images at game start
 * - Renders using drawImage() for optimal performance
 * - Supports directional rendering for hero (eyes face movement direction)
 * - Fallback to canvas drawing if SVG fails to load
 */

class CharacterRenderer {
    constructor() {
        // Image cache for loaded SVGs
        this.images = new Map();
        
        // Loading state
        this.loaded = false;
        this.loadProgress = 0;
        this.totalAssets = 18; // Updated for 4 new monsters + 3 bosses
        
        // Hero direction (radians)
        this.heroDirection = 0;
        
        // Fallback colors for canvas drawing
        this.fallbackColors = {
            hero: '#4ade80',
            zombie: '#4a7c4e',
            ghoul: '#8b4513',
            skeleton: '#d4c5a3',
            witch: '#6b2c91',
            shadow_stalker: '#2d2d2d',
            demon_imp: '#c44536',
            cursed_knight: '#5a6b7c',
            plague_bats: '#6b8c42',
            necromancer: '#4a2d5c',
            void_reaper: '#3d1f4a',
            crypt_wraith: '#7d6b8f',
            berserker_mutant: '#8b3d3d',
            dark_priest: '#2d1a4a',
            crystal_golem: '#4a9d8b',
            lord_of_bones: '#c4b494',
            blood_queen: '#8b0000',
            void_lord: '#2d1a4a'
        };

        // Character radii for canvas fallback
        this.radii = {
            hero: 20,
            zombie: 14,
            ghoul: 12,
            skeleton: 18,
            witch: 14,
            shadow_stalker: 13,
            demon_imp: 10,
            cursed_knight: 20,
            plague_bats: 8,
            necromancer: 14,
            void_reaper: 24,
            crypt_wraith: 15,
            berserker_mutant: 18,
            dark_priest: 16,
            crystal_golem: 22,
            lord_of_bones: 35,
            blood_queen: 32,
            void_lord: 40
        };

        // Asset paths
        this.assetPaths = {
            hero: 'assets/characters/hero.svg',
            zombie: 'assets/monsters/zombie.svg',
            ghoul: 'assets/monsters/ghoul.svg',
            skeleton: 'assets/monsters/skeleton.svg',
            witch: 'assets/monsters/witch.svg',
            shadow_stalker: 'assets/monsters/shadow_stalker.svg',
            demon_imp: 'assets/monsters/demon_imp.svg',
            cursed_knight: 'assets/monsters/cursed_knight.svg',
            plague_bats: 'assets/monsters/plague_bats.svg',
            necromancer: 'assets/monsters/necromancer.svg',
            void_reaper: 'assets/monsters/void_reaper.svg',
            crypt_wraith: 'assets/monsters/crypt_wraith.svg',
            berserker_mutant: 'assets/monsters/berserker_mutant.svg',
            dark_priest: 'assets/monsters/dark_priest.svg',
            crystal_golem: 'assets/monsters/crystal_golem.svg',
            lord_of_bones: 'assets/monsters/lord_of_bones.svg',
            blood_queen: 'assets/monsters/blood_queen.svg',
            void_lord: 'assets/monsters/void_lord.svg'
        };
    }
    
    /**
     * Preload all character SVG assets
     * @param {Function} onComplete - Callback when all assets are loaded
     * @param {Function} onProgress - Callback for loading progress (current, total)
     * @returns {Promise} Promise that resolves when all assets are loaded
     */
    async preload(onComplete, onProgress) {
        const loadPromises = [];
        
        for (const [name, path] of Object.entries(this.assetPaths)) {
            loadPromises.push(this._loadImage(name, path, onProgress));
        }
        
        try {
            await Promise.all(loadPromises);
            this.loaded = true;
            if (onComplete) onComplete();
            console.log('[CharacterRenderer] All assets loaded successfully');
        } catch (error) {
            console.warn('[CharacterRenderer] Some assets failed to load, using fallbacks:', error);
            this.loaded = true; // Still mark as loaded, fallbacks will be used
            if (onComplete) onComplete();
        }
    }
    
    /**
     * Load a single SVG image
     * @private
     */
    _loadImage(name, path, onProgress) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.images.set(name, { image: img, loaded: true });
                this.loadProgress++;
                if (onProgress) onProgress(this.loadProgress, this.totalAssets);
                resolve();
            };
            
            img.onerror = () => {
                console.warn(`[CharacterRenderer] Failed to load ${path}, using canvas fallback`);
                this.images.set(name, { image: null, loaded: false });
                this.loadProgress++;
                if (onProgress) onProgress(this.loadProgress, this.totalAssets);
                resolve(); // Resolve anyway to continue loading other assets
            };
            
            img.src = path;
        });
    }
    
    /**
     * Set hero facing direction
     * @param {number} angle - Angle in radians (0 = right, PI/2 = down, PI = left, -PI/2 = up)
     */
    setHeroDirection(angle) {
        this.heroDirection = angle;
    }
    
    /**
     * Render a character at the specified position
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     * @param {string} type - Character type ('hero' or monster name)
     * @param {number} x - X position (center)
     * @param {number} y - Y position (center)
     * @param {number} [scale=1] - Scale multiplier
     * @param {number} [rotation=0] - Rotation in radians
     */
    render(ctx, type, x, y, scale = 1, rotation = 0) {
        const asset = this.images.get(type);
        
        if (asset && asset.loaded && asset.image) {
            this._renderImage(ctx, asset.image, type, x, y, scale, rotation);
        } else {
            this._renderFallback(ctx, type, x, y, scale, rotation);
        }
    }
    
    /**
     * Render using loaded SVG image
     * @private
     */
    _renderImage(ctx, image, type, x, y, scale, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);
        
        // Center the image
        const size = type === 'hero' ? 80 : 64;
        const offset = size / 2;
        
        // For hero, apply directional eye rendering
        if (type === 'hero') {
            this._renderHeroWithDirection(ctx, image, -offset, -offset, size);
        } else {
            ctx.drawImage(image, -offset, -offset, size, size);
        }
        
        ctx.restore();
    }
    
    /**
     * Render hero with directional eyes
     * @private
     */
    _renderHeroWithDirection(ctx, image, x, y, size) {
        // Draw base image
        ctx.drawImage(image, x, y, size, size);
        
        // Calculate eye offset based on direction
        const eyeOffset = 3;
        const eyeX = Math.cos(this.heroDirection) * eyeOffset;
        const eyeY = Math.sin(this.heroDirection) * eyeOffset;
        
        // The SVG already has animated eyes, but we can add an overlay
        // for more precise directional control if needed
        // For now, the SVG's built-in directional eyes work well
    }
    
    /**
     * Render canvas fallback when SVG fails
     * @private
     */
    _renderFallback(ctx, type, x, y, scale, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);
        
        const color = this.fallbackColors[type] || '#888888';
        const radius = this.radii[type] || 15;
        
        // Draw shadow
        ctx.beginPath();
        ctx.ellipse(0, radius * 0.7, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
        
        // Draw body
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        
        // Create gradient for depth
        const gradient = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 0, 0, 0, radius);
        gradient.addColorStop(0, this._lightenColor(color, 30));
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, this._darkenColor(color, 30));
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = this._darkenColor(color, 40);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw type-specific features
        this._drawFallbackFeatures(ctx, type, radius, color);
        
        ctx.restore();
    }
    
    /**
     * Draw fallback features for each character type
     * @private
     */
    _drawFallbackFeatures(ctx, type, radius, color) {
        switch (type) {
            case 'hero':
                // Draw directional eyes
                const eyeOffset = 4;
                const eyeX = Math.cos(this.heroDirection) * eyeOffset;
                const eyeY = Math.sin(this.heroDirection) * eyeOffset;
                
                // Eye whites
                ctx.beginPath();
                ctx.ellipse(eyeX + 5, eyeY - 3, 4, 3.5, 0, 0, Math.PI * 2);
                ctx.ellipse(eyeX + 13, eyeY - 3, 4, 3.5, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                
                // Pupils (looking in direction)
                const pupilOffset = 2;
                const pupilX = Math.cos(this.heroDirection) * pupilOffset;
                const pupilY = Math.sin(this.heroDirection) * pupilOffset;
                
                ctx.beginPath();
                ctx.arc(eyeX + 7 + pupilX, eyeY - 2 + pupilY, 2.5, 0, Math.PI * 2);
                ctx.arc(eyeX + 15 + pupilX, eyeY - 2 + pupilY, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = '#1e3a8a';
                ctx.fill();
                
                // Cape
                ctx.beginPath();
                ctx.moveTo(-radius + 5, 5);
                ctx.quadraticCurveTo(-radius - 10, 0, -radius - 15, -5);
                ctx.quadraticCurveTo(-radius - 12, 5, -radius - 5, 10);
                ctx.quadraticCurveTo(-radius + 5, 8, -radius + 5, 5);
                ctx.fillStyle = '#1e40af';
                ctx.fill();
                break;
                
            case 'zombie':
                // Dead eyes
                ctx.beginPath();
                ctx.ellipse(-5, -3, 4, 3.5, 0, 0, Math.PI * 2);
                ctx.ellipse(5, -3, 4, 3.5, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#8b9c6e';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(-4, -3, 1.5, 0, Math.PI * 2);
                ctx.arc(6, -4, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = '#1a1a1a';
                ctx.fill();
                
                // Decay spots
                ctx.beginPath();
                ctx.arc(-8, 0, 3, 0, Math.PI * 2);
                ctx.arc(6, 5, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = '#3d5a3d';
                ctx.fill();
                break;
                
            case 'ghoul':
                // Glowing yellow eyes
                ctx.beginPath();
                ctx.ellipse(-5, -2, 4, 3.5, 0, 0, Math.PI * 2);
                ctx.ellipse(5, -2, 4, 3.5, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#ffd700';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(-5, -2, 1.5, 0, Math.PI * 2);
                ctx.arc(5, -2, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = '#000000';
                ctx.fill();
                
                // Sharp teeth
                ctx.beginPath();
                ctx.moveTo(-6, 8);
                ctx.lineTo(-4, 12);
                ctx.lineTo(-2, 8);
                ctx.lineTo(0, 13);
                ctx.lineTo(2, 8);
                ctx.lineTo(4, 12);
                ctx.lineTo(6, 8);
                ctx.fillStyle = '#d4c5a3';
                ctx.fill();
                break;
                
            case 'skeleton':
                // Dark eye sockets with glow
                ctx.beginPath();
                ctx.ellipse(-6, -2, 5, 4.5, 0, 0, Math.PI * 2);
                ctx.ellipse(6, -2, 5, 4.5, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#1a1a1a';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(-5, -2, 2, 0, Math.PI * 2);
                ctx.arc(7, -2, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#ff6b35';
                ctx.fill();
                
                // Nose cavity
                ctx.beginPath();
                ctx.moveTo(0, 2);
                ctx.lineTo(-3, 7);
                ctx.lineTo(3, 7);
                ctx.closePath();
                ctx.fillStyle = '#1a1a1a';
                ctx.fill();
                
                // Teeth
                for (let i = -6; i <= 6; i += 3) {
                    ctx.fillRect(i, 10, 2, 4);
                }
                break;
                
            case 'witch':
                // Pointed hat
                ctx.beginPath();
                ctx.moveTo(-10, -5);
                ctx.lineTo(0, -18);
                ctx.lineTo(10, -5);
                ctx.fillStyle = '#5a237c';
                ctx.fill();
                
                // Glowing eyes under hood
                ctx.beginPath();
                ctx.arc(-5, 0, 2.5, 0, Math.PI * 2);
                ctx.arc(5, 0, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = '#c084fc';
                ctx.fill();
                break;
                
            case 'shadow_stalker':
                // Glowing red eyes
                ctx.beginPath();
                ctx.ellipse(-5, -2, 4, 3, 0, 0, Math.PI * 2);
                ctx.ellipse(5, -2, 4, 3, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#ff3333';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(-4, -2, 1.5, 0, Math.PI * 2);
                ctx.arc(6, -2, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = '#000000';
                ctx.fill();
                
                // Shadow wisps
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                ctx.arc(-12, 0, 4, 0, Math.PI * 2);
                ctx.arc(12, 0, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#1a1a1a';
                ctx.fill();
                ctx.globalAlpha = 1;
                break;
                
            case 'demon_imp':
                // Horns
                ctx.beginPath();
                ctx.moveTo(-6, -8);
                ctx.lineTo(-8, -14);
                ctx.lineTo(-3, -9);
                ctx.moveTo(6, -8);
                ctx.lineTo(8, -14);
                ctx.lineTo(3, -9);
                ctx.fillStyle = '#8b2d22';
                ctx.fill();
                
                // Fiery eyes
                ctx.beginPath();
                ctx.arc(-5, 0, 3, 0, Math.PI * 2);
                ctx.arc(5, 0, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#ffd700';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(-4, 0, 1.5, 0, Math.PI * 2);
                ctx.arc(6, 0, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = '#000000';
                ctx.fill();
                
                // Grin with fangs
                ctx.beginPath();
                ctx.arc(0, 8, 6, 0, Math.PI, false);
                ctx.fillStyle = '#1a0a00';
                ctx.fill();
                break;
                
            case 'cursed_knight':
                // Helmet eye slit
                ctx.fillRect(-8, -4, 16, 5);
                ctx.fillStyle = '#1a1a1a';
                ctx.fill();
                
                // Glowing orange eyes
                ctx.beginPath();
                ctx.arc(-4, -1.5, 2.5, 0, Math.PI * 2);
                ctx.arc(4, -1.5, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = '#ff6b35';
                ctx.fill();
                
                // Armor shine
                ctx.beginPath();
                ctx.ellipse(-5, -5, 4, 3, -0.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();
                break;
                
            case 'plague_bats':
                // Draw 3 small bats
                this._drawFallbackBat(ctx, 0, 0, radius, color);
                this._drawFallbackBat(ctx, -8, -5, radius * 0.7, color);
                this._drawFallbackBat(ctx, 8, -3, radius * 0.7, color);
                break;
                
            case 'necromancer':
                // Deep hood
                ctx.beginPath();
                ctx.arc(0, -5, 12, Math.PI, 0);
                ctx.fillStyle = '#2d1a3d';
                ctx.fill();
                
                // Glowing eyes
                ctx.beginPath();
                ctx.arc(-5, -3, 2.5, 0, Math.PI * 2);
                ctx.arc(5, -3, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = '#c084fc';
                ctx.fill();
                break;
                
            case 'void_reaper':
                // Menacing eyes
                ctx.beginPath();
                ctx.ellipse(-6, -3, 5, 4, 0, 0, Math.PI * 2);
                ctx.ellipse(6, -3, 5, 4, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#0a0014';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(-5, -3, 2.5, 0, Math.PI * 2);
                ctx.arc(7, -3, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = '#c084fc';
                ctx.fill();

                // Void aura
                ctx.beginPath();
                ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(192, 132, 252, 0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();
                break;

            case 'crypt_wraith':
                // Ghostly hooded figure
                ctx.beginPath();
                ctx.ellipse(0, 0, radius * 0.7, radius, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(125, 107, 143, 0.7)';
                ctx.fill();

                // Hood shadow
                ctx.beginPath();
                ctx.arc(0, -radius * 0.3, radius * 0.6, Math.PI, 0);
                ctx.fillStyle = '#5a4d6a';
                ctx.fill();

                // Glowing red eyes
                ctx.beginPath();
                ctx.arc(-radius * 0.25, -radius * 0.2, radius * 0.2, 0, Math.PI * 2);
                ctx.arc(radius * 0.25, -radius * 0.2, radius * 0.2, 0, Math.PI * 2);
                ctx.fillStyle = '#ff6b6b';
                ctx.fill();

                // Wispy edges
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                ctx.arc(-radius * 0.5, radius * 0.5, radius * 0.3, 0, Math.PI * 2);
                ctx.arc(radius * 0.5, radius * 0.5, radius * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.globalAlpha = 1;
                break;

            case 'berserker_mutant':
                // Wild hair
                ctx.beginPath();
                ctx.moveTo(-radius * 0.5, -radius * 0.6);
                ctx.lineTo(-radius * 0.7, -radius * 0.9);
                ctx.lineTo(-radius * 0.3, -radius * 0.7);
                ctx.lineTo(0, -radius * 0.95);
                ctx.lineTo(radius * 0.3, -radius * 0.7);
                ctx.lineTo(radius * 0.7, -radius * 0.9);
                ctx.lineTo(radius * 0.5, -radius * 0.6);
                ctx.fillStyle = '#4a3728';
                ctx.fill();

                // Angry eyebrows
                ctx.beginPath();
                ctx.moveTo(-radius * 0.4, -radius * 0.3);
                ctx.lineTo(-radius * 0.1, -radius * 0.2);
                ctx.moveTo(radius * 0.4, -radius * 0.3);
                ctx.lineTo(radius * 0.1, -radius * 0.2);
                ctx.strokeStyle = '#2d1f15';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Bloodshot eyes
                ctx.beginPath();
                ctx.arc(-radius * 0.3, 0, radius * 0.25, 0, Math.PI * 2);
                ctx.arc(radius * 0.3, 0, radius * 0.25, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(-radius * 0.25, 0, radius * 0.12, 0, Math.PI * 2);
                ctx.arc(radius * 0.25, 0, radius * 0.12, 0, Math.PI * 2);
                ctx.fillStyle = '#ff3333';
                ctx.fill();

                // Fanged mouth
                ctx.beginPath();
                ctx.arc(0, radius * 0.4, radius * 0.35, 0, Math.PI, false);
                ctx.fillStyle = '#4a0000';
                ctx.fill();
                break;

            case 'dark_priest':
                // Deep hood
                ctx.beginPath();
                ctx.arc(0, -radius * 0.2, radius * 0.7, Math.PI, 0);
                ctx.fillStyle = '#4a3d5a';
                ctx.fill();

                // Glowing purple eyes under hood
                ctx.beginPath();
                ctx.arc(-radius * 0.25, 0, radius * 0.2, 0, Math.PI * 2);
                ctx.arc(radius * 0.25, 0, radius * 0.2, 0, Math.PI * 2);
                ctx.fillStyle = '#c084fc';
                ctx.fill();

                // Dark orb above head
                ctx.beginPath();
                ctx.arc(0, -radius * 0.9, radius * 0.35, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(147, 112, 219, 0.6)';
                ctx.fill();

                // Rune symbols
                ctx.strokeStyle = '#9370db';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-radius * 0.5, -radius * 0.8);
                ctx.lineTo(-radius * 0.3, -radius * 0.9);
                ctx.lineTo(-radius * 0.5, -radius * 1.0);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(radius * 0.5, -radius * 0.8);
                ctx.lineTo(radius * 0.3, -radius * 0.9);
                ctx.lineTo(radius * 0.5, -radius * 1.0);
                ctx.stroke();
                break;

            case 'crystal_golem':
                // Crystalline body
                ctx.beginPath();
                ctx.moveTo(0, -radius * 0.8);
                ctx.lineTo(radius * 0.6, -radius * 0.3);
                ctx.lineTo(radius * 0.7, radius * 0.5);
                ctx.lineTo(0, radius * 0.8);
                ctx.lineTo(-radius * 0.7, radius * 0.5);
                ctx.lineTo(-radius * 0.6, -radius * 0.3);
                ctx.closePath();
                ctx.fillStyle = 'rgba(74, 157, 139, 0.8)';
                ctx.fill();

                // Crystal facets
                ctx.beginPath();
                ctx.moveTo(0, -radius * 0.5);
                ctx.lineTo(radius * 0.3, 0);
                ctx.lineTo(0, radius * 0.4);
                ctx.lineTo(-radius * 0.3, 0);
                ctx.closePath();
                ctx.fillStyle = 'rgba(125, 211, 196, 0.5)';
                ctx.fill();

                // Glowing red eyes
                ctx.beginPath();
                ctx.moveTo(-radius * 0.25, -radius * 0.3);
                ctx.lineTo(-radius * 0.1, -radius * 0.2);
                ctx.lineTo(-radius * 0.25, -radius * 0.1);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(radius * 0.25, -radius * 0.3);
                ctx.lineTo(radius * 0.1, -radius * 0.2);
                ctx.lineTo(radius * 0.25, -radius * 0.1);
                ctx.fill();
                ctx.fillStyle = '#ff6b6b';
                ctx.fill();

                // Crystal arm spikes
                ctx.beginPath();
                ctx.moveTo(-radius * 0.7, 0);
                ctx.lineTo(-radius * 0.9, -radius * 0.2);
                ctx.lineTo(-radius * 0.85, radius * 0.2);
                ctx.closePath();
                ctx.fillStyle = color;
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(radius * 0.7, 0);
                ctx.lineTo(radius * 0.9, -radius * 0.2);
                ctx.lineTo(radius * 0.85, radius * 0.2);
                ctx.closePath();
                ctx.fill();
                break;
        }
    }
    
    /**
     * Draw a single bat for plague bats fallback
     * @private
     */
    _drawFallbackBat(ctx, x, y, size, color) {
        ctx.save();
        ctx.translate(x, y);
        
        // Wings
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-size, -size * 0.5, -size * 1.5, 0);
        ctx.quadraticCurveTo(-size, size * 0.5, 0, size * 0.3);
        ctx.quadraticCurveTo(size, size * 0.5, size * 1.5, 0);
        ctx.quadraticCurveTo(size, -size * 0.5, 0, 0);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Body
        ctx.beginPath();
        ctx.ellipse(0, size * 0.2, size * 0.4, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = this._darkenColor(color, 20);
        ctx.fill();
        
        // Eyes
        ctx.beginPath();
        ctx.arc(-size * 0.15, 0, size * 0.15, 0, Math.PI * 2);
        ctx.arc(size * 0.15, 0, size * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = '#c0ff80';
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Lighten a hex color
     * @private
     */
    _lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }
    
    /**
     * Darken a hex color
     * @private
     */
    _darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }
    
    /**
     * Check if a specific asset is loaded
     * @param {string} type - Character type
     * @returns {boolean}
     */
    isLoaded(type) {
        const asset = this.images.get(type);
        return asset && asset.loaded;
    }
    
    /**
     * Get loading status for all assets
     * @returns {Object} Status object with each asset's load state
     */
    getLoadStatus() {
        const status = {};
        for (const [name, asset] of this.images) {
            status[name] = asset.loaded;
        }
        return status;
    }
    
    /**
     * Clear all loaded images (for memory management)
     */
    dispose() {
        for (const [name, asset] of this.images) {
            if (asset.image) {
                asset.image.src = '';
            }
        }
        this.images.clear();
        this.loaded = false;
        this.loadProgress = 0;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterRenderer;
}

// Global instance for easy access
window.CharacterRenderer = CharacterRenderer;
