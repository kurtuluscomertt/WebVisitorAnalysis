(function() {
    let sessionId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    let startTime = new Date().getTime();
    let lastPageUrl = window.location.href;
    let navigationPath = [lastPageUrl];
    let scrollDepth = 0;
    let interactions = [];
    let clickedElements = [];
    let hoverInteractions = [];
    let videoInteractions = {};
    let copiedText = [];
    let jsErrors = [];
    let ajaxInteractions = [];
    let formInteractions = {};

    // Performance metrics
    let fcpValue, lcpValue, fidValue, clsValue, ttiValue;

    // Veri toplama sıklığını artıralım
    const DATA_COLLECTION_INTERVAL = 30000; // 30 saniyede bir veri topla

    // Observe performance metrics
    if (window.PerformanceObserver) {
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    fcpValue = entry.startTime;
                } else if (entry.name === 'largest-contentful-paint') {
                    lcpValue = entry.startTime;
                } else if (entry.entryType === 'first-input') {
                    fidValue = entry.processingStart - entry.startTime;
                } else if (entry.entryType === 'layout-shift') {
                    clsValue = (clsValue || 0) + entry.value;
                }
            }
        }).observe({type: ['paint', 'first-input', 'layout-shift'], buffered: true});

        // Observe Time to Interactive (TTI)
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            ttiValue = entries[entries.length - 1].startTime;
        }).observe({type: 'longtask', buffered: true});
    }

    // Click interactions
    document.addEventListener('click', function(e) {
        clickedElements.push({
            tagName: e.target.tagName,
            id: e.target.id,
            className: e.target.className,
            text: e.target.textContent.trim().substring(0, 50), // İlk 50 karakter
            path: e.composedPath ? e.composedPath().map(el => el.tagName).join(' > ') : '',
            time: new Date().getTime() - startTime,
            x: e.clientX,
            y: e.clientY
        });
    }, true);

    // Hover interactions
    document.addEventListener('mouseover', function(e) {
        hoverInteractions.push({
            tagName: e.target.tagName,
            id: e.target.id,
            className: e.target.className,
            text: e.target.textContent.trim().substring(0, 50), // İlk 50 karakter
            time: new Date().getTime() - startTime,
            x: e.clientX,
            y: e.clientY
        });
    }, true);

    // Scroll depth
    window.addEventListener('scroll', function() {
        let scrollPosition = window.pageYOffset;
        let totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        scrollDepth = Math.round((scrollPosition / totalHeight) * 100);
    });

    // Copy text
    document.addEventListener('copy', function(e) {
        copiedText.push(window.getSelection().toString());
    });

    // JS errors
    window.onerror = function(message, source, lineno, colno, error) {
        jsErrors.push({
            message: message,
            source: source,
            lineno: lineno,
            colno: colno,
            stack: error ? error.stack : null,
            time: new Date().getTime() - startTime
        });
    };

    // AJAX interactions
    if (window.XMLHttpRequest) {
        let originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            let xhr = new originalXHR();
            xhr.addEventListener('load', function() {
                ajaxInteractions.push({
                    url: this._url,
                    method: this._method,
                    status: this.status,
                    time: new Date().getTime()
                });
            });
            return xhr;
        };

        let originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            this._url = url;
            this._method = method;
            originalOpen.apply(this, arguments);
        };
    }

    // Form interactions
    document.addEventListener('submit', function(e) {
        if (e.target.tagName === 'FORM') {
            formInteractions[e.target.id || e.target.name] = {
                submitted: true,
                time: new Date().getTime() - startTime
            };
        }
    }, true);

    // Video interactions
    document.addEventListener('play', function(e) {
        if (e.target.tagName === 'VIDEO') {
            videoInteractions[e.target.id || e.target.src] = {
                action: 'play',
                time: new Date().getTime() - startTime
            };
        }
    }, true);

    document.addEventListener('pause', function(e) {
        if (e.target.tagName === 'VIDEO') {
            videoInteractions[e.target.id || e.target.src] = {
                action: 'pause',
                time: new Date().getTime() - startTime
            };
        }
    }, true);

    // Helper functions
    function getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return "tablet";
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return "mobile";
        }
        return "desktop";
    }

    function getOperatingSystem() {
        const userAgent = window.navigator.userAgent,
              platform = window.navigator.platform,
              macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
              windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
              iosPlatforms = ['iPhone', 'iPad', 'iPod'];

        if (macosPlatforms.indexOf(platform) !== -1) {
            return 'Mac OS';
        } else if (iosPlatforms.indexOf(platform) !== -1) {
            return 'iOS';
        } else if (windowsPlatforms.indexOf(platform) !== -1) {
            return 'Windows';
        } else if (/Android/.test(userAgent)) {
            return 'Android';
        } else if (/Linux/.test(platform)) {
            return 'Linux';
        }

        return 'Unknown';
    }

    function getBrowserInfo() {
        const ua = navigator.userAgent;
        let tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        return M.join(' ');
    }

    function getNetworkInfo() {
        if (navigator.connection) {
            return {
                type: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            };
        }
        return null;
    }

    function getJSFrameworks() {
        const frameworks = [];
        if (window.angular) frameworks.push('Angular');
        if (window.React) frameworks.push('React');
        if (window.Vue) frameworks.push('Vue');
        if (window.jQuery) frameworks.push('jQuery');
        return frameworks;
    }

    function getBatteryStatus() {
        if ('getBattery' in navigator) {
            return navigator.getBattery().then(function(battery) {
                return {
                    level: battery.level,
                    charging: battery.charging
                };
            });
        }
        return Promise.resolve(null);
    }

    function getLocationInfo() {
        return fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(data => ({
                city: data.city,
                country: data.country_name
            }))
            .catch(() => ({
                city: 'Unknown',
                country: 'Unknown'
            }));
    }

    // Collect and send data
    function collectAndSendData() {
        let endTime = new Date().getTime();
        
        Promise.all([getBatteryStatus(), getLocationInfo()]).then(([batteryStatus, locationInfo]) => {
            let data = {
                sessionId: sessionId,
                url: lastPageUrl,
                referrer: document.referrer,
                userAgent: navigator.userAgent,
                screenResolution: screen.width + 'x' + screen.height,
                language: navigator.language || navigator.userLanguage,
                timestamp: new Date().toISOString(),
                pageLoadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                sessionDuration: (endTime - startTime) / 1000,
                pageInteractions: JSON.stringify(interactions),
                deviceType: getDeviceType(),
                operatingSystem: getOperatingSystem(),
                browser: getBrowserInfo(),
                timeOnPage: (endTime - startTime) / 1000,
                navigationPath: JSON.stringify(navigationPath),
                fcp: fcpValue,
                lcp: lcpValue,
                fid: fidValue,
                cls: clsValue,
                tti: ttiValue,
                scrollDepth: scrollDepth,
                clickedElements: JSON.stringify(clickedElements),
                hoverInteractions: JSON.stringify(hoverInteractions),
                videoInteractions: JSON.stringify(videoInteractions),
                copiedText: JSON.stringify(copiedText),
                networkInfo: JSON.stringify(getNetworkInfo()),
                jsFrameworks: JSON.stringify(getJSFrameworks()),
                deviceOrientation: screen.orientation ? screen.orientation.type : null,
                batteryStatus: JSON.stringify(batteryStatus),
                jsErrors: JSON.stringify(jsErrors),
                ajaxInteractions: JSON.stringify(ajaxInteractions),
                formInteractions: JSON.stringify(formInteractions),
                visitTime: new Date().toISOString(),
                dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
                resourceTimings: JSON.stringify(performance.getEntriesByType('resource')),
                city: locationInfo.city,
                country: locationInfo.country
            };

            fetch('https://artificapi.com/tools/log.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                console.log('Server response:', result);
                // Başarılı gönderimden sonra dizileri temizleyelim
                clickedElements = [];
                hoverInteractions = [];
                jsErrors = [];
                ajaxInteractions = [];
                copiedText = [];
                videoInteractions = {};
                formInteractions = {};
            })
            .catch(error => console.error('Error:', error));
        });
    }

    // Send data before page unload
    window.addEventListener('beforeunload', collectAndSendData);

    // Send data periodically
    setInterval(collectAndSendData, DATA_COLLECTION_INTERVAL);

    // SPA navigation handling
    let oldPushState = history.pushState;
    history.pushState = function(state) {
        oldPushState.apply(this, arguments);
        navigationPath.push(window.location.href);
        collectAndSendData(); // Collect data on each navigation
    };

    window.addEventListener('popstate', function() {
        navigationPath.push(window.location.href);
        collectAndSendData(); // Collect data on each navigation
    });

    // Initial data collection
    window.addEventListener('load', function() {
        startTime = new Date().getTime();
        console.log('Page loaded. Setting up data collection.');
        setTimeout(collectAndSendData, 3000); // Collect data 3 seconds after page load
    });
})();