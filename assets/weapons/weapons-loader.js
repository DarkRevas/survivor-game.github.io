/**
 * Shadow Survivor - Weapon Assets Loader
 * Handles preloading, caching, and rendering of SVG weapon assets
 * with emoji fallback for failed loads
 */

const WeaponAssets = (function() {
    // Weapon definitions with SVG paths and emoji fallbacks
    const WEAPONS = {
        magic_aura: {
            name: 'Magic Aura',
            svg: 'assets/weapons/magic_aura.svg',
            emoji: '🔮',
            image: null,
            loaded: false,
            failed: false
        },
        fireball_arc: {
            name: 'Fireball Arc',
            svg: 'assets/weapons/fireball_arc.svg',
            emoji: '🔥',
            image: null,
            loaded: false,
            failed: false
        },
        magic_wand: {
            name: 'Magic Wand',
            svg: 'assets/weapons/magic_wand.svg',
            emoji: '🪄',
            image: null,
            loaded: false,
            failed: false
        },
        throwing_knife: {
            name: 'Throwing Knife',
            svg: 'assets/weapons/throwing_knife.svg',
            emoji: '🗡️',
            image: null,
            loaded: false,
            failed: false
        },
        lightning_bolt: {
            name: 'Lightning Bolt',
            svg: 'assets/weapons/lightning_bolt.svg',
            emoji: '⚡',
            image: null,
            loaded: false,
            failed: false
        },
        holy_water: {
            name: 'Holy Water',
            svg: 'assets/weapons/holy_water.svg',
            emoji: '💧',
            image: null,
            loaded: false,
            failed: false
        },
        ice_shard: {
            name: 'Ice Shard',
            svg: 'assets/weapons/ice_shard.svg',
            emoji: '🧊',
            image: null,
            loaded: false,
            failed: false
        },
        sacred_cross: {
            name: 'Sacred Cross',
            svg: 'assets/weapons/sacred_cross.svg',
            emoji: '✝️',
            image: null,
            loaded: false,
            failed: false
        },
        poison_dagger: {
            name: 'Poison Dagger',
            svg: 'assets/weapons/poison_dagger.svg',
            emoji: '🏹',
            image: null,
            loaded: false,
            failed: false
        },
        spin_blade: {
            name: 'Spin Blade',
            svg: 'assets/weapons/spin_blade.svg',
            emoji: '🌀',
            image: null,
            loaded: false,
            failed: false
        }
    };

    // Cache for rendered weapon images at different sizes
    const sizeCache = new Map();
    
    // Default weapon size
    const DEFAULT_SIZE = 64;

    /**
     * Preload all weapon SVG images
     * @returns {Promise} Resolves when all weapons are loaded (or failed)
     */
    function preloadAll() {
        const promises = Object.keys(WEAPONS).map(key => preloadWeapon(key));
        return Promise.allSettled(promises);
    }

    /**
     * Preload a single weapon SVG
     * @param {string} weaponKey - The weapon key (e.g., 'magic_aura')
     * @returns {Promise} Resolves when the weapon is loaded
     */
    function preloadWeapon(weaponKey) {
        return new Promise((resolve, reject) => {
            const weapon = WEAPONS[weaponKey];
            if (!weapon) {
                reject(new Error(`Unknown weapon: ${weaponKey}`));
                return;
            }

            const img = new Image();
            img.onload = () => {
                weapon.image = img;
                weapon.loaded = true;
                weapon.failed = false;
                console.log(`[WeaponAssets] Loaded: ${weapon.name}`);
                resolve(weapon);
            };
            img.onerror = () => {
                weapon.loaded = false;
                weapon.failed = true;
                console.warn(`[WeaponAssets] Failed to load ${weapon.name}, using emoji fallback`);
                resolve(weapon); // Resolve anyway to not block game start
            };
            
            // Add cache busting parameter if needed
            img.src = `${weapon.svg}?t=${Date.now()}`;
        });
    }

    /**
     * Get weapon data by key
     * @param {string} weaponKey - The weapon key
     * @returns {Object} Weapon data object
     */
    function getWeapon(weaponKey) {
        return WEAPONS[weaponKey] || null;
    }

    /**
     * Check if a weapon is loaded and ready
     * @param {string} weaponKey - The weapon key
     * @returns {boolean} True if loaded
     */
    function isLoaded(weaponKey) {
        const weapon = WEAPONS[weaponKey];
        return weapon ? weapon.loaded : false;
    }

    /**
     * Check if all weapons are loaded
     * @returns {boolean} True if all loaded
     */
    function allLoaded() {
        return Object.values(WEAPONS).every(w => w.loaded || w.failed);
    }

    /**
     * Get loading progress (0-1)
     * @returns {number} Progress value
     */
    function getLoadProgress() {
        const total = Object.keys(WEAPONS).length;
        const loaded = Object.values(WEAPONS).filter(w => w.loaded || w.failed).length;
        return loaded / total;
    }

    /**
     * Render a weapon on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} weaponKey - The weapon key
     * @param {number} x - X position (center)
     * @param {number} y - Y position (center)
     * @param {number} size - Size in pixels (default: 64)
     * @param {number} rotation - Rotation in radians (default: 0)
     * @param {number} alpha - Opacity 0-1 (default: 1)
     */
    function render(ctx, weaponKey, x, y, size = DEFAULT_SIZE, rotation = 0, alpha = 1) {
        const weapon = WEAPONS[weaponKey];
        if (!weapon) {
            console.warn(`[WeaponAssets] Unknown weapon: ${weaponKey}`);
            return;
        }

        const halfSize = size / 2;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.rotate(rotation);

        if (weapon.loaded && weapon.image) {
            // Draw SVG image
            ctx.drawImage(weapon.image, -halfSize, -halfSize, size, size);
        } else {
            // Fallback to emoji
            ctx.font = `${size * 0.8}px Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(weapon.emoji, 0, 0);
        }

        ctx.restore();
    }

    /**
     * Render weapon with glow effect
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} weaponKey - The weapon key
     * @param {number} x - X position (center)
     * @param {number} y - Y position (center)
     * @param {number} size - Size in pixels
     * @param {string} glowColor - Glow color (e.g., '#ff6b35')
     * @param {number} glowIntensity - Glow blur amount
     */
    function renderWithGlow(ctx, weaponKey, x, y, size = DEFAULT_SIZE, glowColor = '#ffffff', glowIntensity = 10) {
        const weapon = WEAPONS[weaponKey];
        if (!weapon) return;

        const halfSize = size / 2;

        ctx.save();
        ctx.translate(x, y);

        // Create glow effect
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowIntensity;

        if (weapon.loaded && weapon.image) {
            ctx.drawImage(weapon.image, -halfSize, -halfSize, size, size);
        } else {
            ctx.font = `${size * 0.8}px Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(weapon.emoji, 0, 0);
        }

        ctx.restore();
    }

    /**
     * Render weapon as UI icon (smaller, no rotation)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} weaponKey - The weapon key
     * @param {number} x - X position (top-left)
     * @param {number} y - Y position (top-left)
     * @param {number} size - Size in pixels (default: 32)
     */
    function renderIcon(ctx, weaponKey, x, y, size = 32) {
        render(ctx, weaponKey, x + size / 2, y + size / 2, size, 0, 1);
    }

    /**
     * Get all weapon keys
     * @returns {string[]} Array of weapon keys
     */
    function getAllKeys() {
        return Object.keys(WEAPONS);
    }

    /**
     * Get all weapons data
     * @returns {Object} All weapons data
     */
    function getAllWeapons() {
        return WEAPONS;
    }

    /**
     * Create a weapon picker for debugging/selection
     * @returns {Object} Debug info
     */
    function getDebugInfo() {
        return Object.entries(WEAPONS).map(([key, weapon]) => ({
            key,
            name: weapon.name,
            loaded: weapon.loaded,
            failed: weapon.failed,
            emoji: weapon.emoji
        }));
    }

    // Public API
    return {
        preloadAll,
        preloadWeapon,
        getWeapon,
        isLoaded,
        allLoaded,
        getLoadProgress,
        render,
        renderWithGlow,
        renderIcon,
        getAllKeys,
        getAllWeapons,
        getDebugInfo,
        DEFAULT_SIZE
    };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeaponAssets;
}
