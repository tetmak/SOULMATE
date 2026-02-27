/**
 * Theme Engine - Light/Dark Mode Manager
 * localStorage key: numerael_theme
 * Values: 'dark' | 'light' | 'system'
 */
(function() {
    'use strict';

    var STORAGE_KEY = 'numerael_theme';
    var DEFAULT_THEME = 'light';

    // Apply theme IMMEDIATELY before DOM renders (called inline in <head>)
    function getPreferredTheme() {
        var saved = null;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch(e) {}
        if (saved === 'light' || saved === 'dark') return saved;
        if (saved === 'system') {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }
        return DEFAULT_THEME;
    }

    function applyTheme(theme) {
        var root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        // Set data attribute for CSS variable-based styles
        root.setAttribute('data-theme', theme);
    }

    // Apply immediately on script load (before DOM ready)
    var currentTheme = getPreferredTheme();
    applyTheme(currentTheme);

    // Public API
    window.themeEngine = {
        // Get current active theme ('light' or 'dark')
        current: function() {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        },

        // Get saved preference ('light', 'dark', or 'system')
        getSaved: function() {
            try { return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME; } catch(e) { return DEFAULT_THEME; }
        },

        // Set theme: 'light', 'dark', or 'system'
        set: function(theme) {
            try { localStorage.setItem(STORAGE_KEY, theme); } catch(e) {}
            var resolved = theme;
            if (theme === 'system') {
                resolved = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
            }
            applyTheme(resolved);
            // Dispatch event for listeners
            try {
                window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: resolved, preference: theme } }));
            } catch(e) {}
        },

        // Toggle between light and dark
        toggle: function() {
            var next = this.current() === 'dark' ? 'light' : 'dark';
            this.set(next);
            return next;
        },

        // Check if dark mode
        isDark: function() {
            return this.current() === 'dark';
        }
    };

    // Listen for system preference changes
    if (window.matchMedia) {
        try {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
                var saved = window.themeEngine.getSaved();
                if (saved === 'system') {
                    applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        } catch(e) {}
    }
})();
