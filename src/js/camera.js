/*
 * No Copyrights Infringement is intended. If anything was used that may have
 * copyrights, please let us know and we will remove it.
 *
 * This file implement the color tracking using the tracking.js library.
 * We use it to briefly implement an AI color recognition system.
 *
 * Concordia University
 * CART 351 : Networks & Navigation
 * Written by Vsevolod (Seva) Ivanov
 *
*/

// The colors we want to track
var cameraColors = {
    pink:
    {
        hex: '#877f7f',
        rectCounter: 0,
        percentage: 0
    },
    red: {
        hex: '#ffffff',
        rectCounter: 0,
        percentage: 0
    },
    blue: {
        hex: '#ffffff',
        rectCounter: 0,
        percentage: 0
    },
    green: {
        hex: '#ffffff',
        rectCounter: 0,
        percentage: 0
    },
    yellow: {
        hex: '#ffffff',
        rectCounter: 0,
        percentage: 0
    },
    black: {
        hex: '#ffffff',
        rectCounter: 0,
        percentage: 0
    }
};

var supportedColors = ["cyan", "magenta", "yellow"],
    trackedColors = Object.keys(cameraColors); //.concat(supportedColors);

var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    tracker = new tracking.ColorTracker(),
    cameraReady = false;

// Capture vars to time the color processing
var capStart = (new Date()).getTime(),  // secs
    capInterval = 5,                    // secs
    capDelay = 0.1;                     // secs

tracker.on('track', function(event)
{
    cameraReady = true;
    context.clearRect(0, 0, canvas.width, canvas.height);

    event.data.forEach(function(rect)
    {
        // Colors logic
        //console.log(rect.color);

        // New capture - reset parms
        if (diffInSeconds(capStart) == capInterval)
        {
            for (var name in cameraColors)
            {
                cameraColors[name].rectCounter = 0;
                cameraColors[name].percentage = 0;
            }
        }
        // It will look every n sec (interval) during k sec (delay)
        if ((diffInSeconds(capStart) >= capInterval) &&
            (diffInSeconds(capStart) <= (capInterval + capDelay)))
        {
            //console.log('timed color capturing ');
            /* FIXME:
             *  Getting called too many times even with 0 delay
             *  Maybe due to the tracking events going too fast
             */
            updateColorPercentage(rect);
        }
        // After which it will reset the time
        else if (diffInSeconds(capStart) >= capInterval + capDelay)
        {
            capStart = (new Date()).getTime();
            for (var name in cameraColors)
            {
                /*
                console.log("Color : " + name);
                console.log("Rectangles : " + cameraColors[name].rectCounter);
                console.log("Percentage : " + cameraColors[name].percentage);
                */
            }
        }

        /* To see them on camera display
         * turn-off the z-index on #container
         */
        drawRectangles(context, rect);
    });

    // Add the cameraColors to the tracker
    for (var name in cameraColors)
    {
        tracker.customColor = cameraColors[name];
        createCustomColor(
            tracking, name, cameraColors[name].hex);
    }
    // Update the tracker
    tracker.setColors(trackedColors);
});

function updateColorPercentage(rect)
{
    var name = rect.color,
        canvasSurface = canvas.width * canvas.height,
        rectSurface = rect.width * rect.height;

    var rectSurfacePercentage = Math.floor(rectSurface / canvasSurface);

    var newPercentage = cameraColors[name].percentage + rectSurfacePercentage;

    if (newPercentage > 100)
    {
        newPercentage = 100;
    }

    cameraColors[name].rectCounter++;
    cameraColors[name].percentage = newPercentage;
}

function initCameraTracking()
{
    tracking.track('#video', tracker, { camera: true });
}

function createCustomColor(tracking, colorName, value)
{
    /* This function is taken from:
     * https://github.com/eduardolundgren/tracking.js/blob/master/examples/assets/color_camera_gui.js
     *
     * It registers a color at tracking.js by defining the r b g precision of
     * custom color and it is tagging this colors by a colorName that we can
     * later use in the tracker events.
     */
    var components = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value),
        customColorR = parseInt(components[1], 16),
        customColorG = parseInt(components[2], 16),
        customColorB = parseInt(components[3], 16);

    var colorTotal = customColorR + customColorG + customColorB;

    if (colorTotal === 0)
    {
        tracking.ColorTracker.registerColor(colorName, function(r, g, b) {
            return r + g + b < 10;
        });
    }
    else
    {
        var rRatio = customColorR / colorTotal;
        var gRatio = customColorG / colorTotal;

        tracking.ColorTracker.registerColor(colorName, function(r, g, b) {
            var colorTotal2 = r + g + b;

            if (colorTotal2 === 0) {
                if (colorTotal < 10) {
                    return true;
                }
                return false;
            }

            var rRatio2 = r / colorTotal2,
                gRatio2 = g / colorTotal2,
                deltaColorTotal = colorTotal / colorTotal2,
                deltaR = rRatio / rRatio2,
                deltaG = gRatio / gRatio2;

            return deltaColorTotal > 0.9 && deltaColorTotal < 1.1 &&
                deltaR > 0.9 && deltaR < 1.1 &&
                deltaG > 0.9 && deltaG < 1.1;
        });
    }
}

function drawRectangles(context, rect)
{
    /* We draw rectangles in the context of our canvas to display for a human
     * interpretation the detected areas by color that we track.
     */
    if (trackedColors.indexOf(rect.color) != -1)
    {
        // Set its borders to the same color that we track
        rect.color = cameraColors[rect.color];
    }
    else
    {
        rect.color = 'red';
    }
    rect.color = '#ffffff';
    context.strokeStyle = rect.color;
    context.strokeRect(rect.x, rect.y,
            rect.width, rect.height
    );
    context.font = '11px Helvetica';
    context.fillStyle = "#fff";
    context.fillText('x: ' + rect.x + 'px',
            rect.x + rect.width + 5, rect.y + 11
    );
    context.fillText('y: ' + rect.y + 'px',
            rect.x + rect.width + 5, rect.y + 22
    );
}

function diffInSeconds(fromTime)
{
    var endDate = new Date();
    return Math.floor(
        (endDate - fromTime) / 1000
    );
}

function cameraHasColors()
{
    for (var name in cameraColors)
    {
        if (cameraColors[name].percentage > 0)
        {
            return true;
        }
    }
    return false;
}
