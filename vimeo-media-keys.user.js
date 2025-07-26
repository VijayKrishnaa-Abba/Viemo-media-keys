// ==UserScript==
// @name         Vimeo Media Keys with Dynamic Loader
// @namespace    https://greasyfork.org/en/users/1330666
// @version      1.1
// @description  Adds media key controls (rewind/forward/play/pause) for Vimeo player after dynamic load
// @match        https://vimeo.com/*
// @match        https://player.vimeo.com/*
// @grant        none
// @license      GPL-3.0-or-later
// ==/UserScript==

(function () {
    'use strict';

    const waitForElement = (selector, timeout = 10000) =>
        new Promise((resolve, reject) => {
            const start = Date.now();
            const timer = setInterval(() => {
                const el = document.querySelector(selector);
                if (el) return clearInterval(timer), resolve(el);
                if (Date.now() - start > timeout) clearInterval(timer), reject();
            }, 100);
        });

    async function bindMediaKeys() {
        try {
            const video = await waitForElement('video');
            if (!video) return;

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                video.currentTime = Math.max(0, video.currentTime - 10);
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                video.currentTime = Math.min(video.duration, video.currentTime + 10);
            });

            navigator.mediaSession.setActionHandler('play', () => video.play());
            navigator.mediaSession.setActionHandler('pause', () => video.pause());

            console.log('🎬 Media key handlers attached.');
        } catch (e) {
            console.warn('⚠️ Video element not found in time:', e);
        }
    }

    // Initial trigger after small delay
    setTimeout(bindMediaKeys, 2000);

    // Handle single-page routing changes (for Vimeo's dynamic navigation)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            setTimeout(bindMediaKeys, 2000);
        }
    }).observe(document, { childList: true, subtree: true });
})();
