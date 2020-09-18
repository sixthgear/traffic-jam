/* 
Road drawing methods
Uses a pseudo-3d raster engine inspired by http://www.extentofthejam.com/pseudo/
*/

// A Segment of Track
interface Segment {
    dx: number,
    length: number,
}

// The Whole Track
class Track {

    HORIZON = 75; // height of the horizon in pixels 
    CAMERA_HEIGHT = 1000; // fixed camera height in world coords    
    ROAD_WIDTH_MIN = 10; // the length of the road at the furthest position
    ROAD_WIDTH_MAX = scene.screenWidth(); // the length of the road at the closest position
    LINE_WIDTH = 4; // width of the dotted lines 
    EDGE_WIDTH = 16; // width of the edge lines (these are drawn outside of the actual road)
    STRIPE_SIZE = 16; // world-z-distance of each light-dark stripe

    // array of each track segment
    segments: Segment[] = [];    

    // precomputed map of line properties per horizontal line (for better performance)    
    zMap: any[] = [];

    constructor() {

        // precompute each line between bottom of screen and horizon
        for (let n=0; n<this.HORIZON; n++) {
            this.zMap.push(this.precompute(n));
        }
    }

    // projects a screen Y coordinate to a world Z distance
    project(wy: number, sy: number) {
        // wy is the world height of the camera/object (negative)
        // sy is the screen y coordinate
        return wy / (sy - this.HORIZON)
    }

    // precompute line properties for each line we want to draw into
    // this helps our raster rendering system
    precompute(sy: number) {
        const scaler =  1 - sy / this.HORIZON; // number between 0 and 1
        const width = this.ROAD_WIDTH_MIN + ((this.ROAD_WIDTH_MAX - this.ROAD_WIDTH_MIN) * scaler); // scaled width between 10 and 160        
        return {        
            // projected z value for this line (relative to the camera's world z) 
            z: this.project(-this.CAMERA_HEIGHT, sy), 
            width: width, // width of the road
            lineWidth: Math.max(1, this.LINE_WIDTH * scaler),
            edgeWidth: Math.max(1, this.EDGE_WIDTH * scaler),
        }
    }

    getSegment(seg: number): Segment {
        return this.segments[seg];        
    }

    getNextSegment(seg: number): Segment {
        return this.segments[(seg + 1) % this.segments.length]
    }

    generate(n: number): void {
    
        this.segments = [        
            {dx: 0, length: 800}, // starting segment is always straight        
            // {dx: +0.02, length: 200}, // right turn example
            // {dx: -0.04, length: 250}, // left turn example        
        ];

        // create random track of 16 track segments
        for (let x=0; x<n; x++) {
            let s: Segment;
            switch(randint(1, 4)) {
                case 1:
                    s = {dx: randint(1, 4) * -0.01, length: randint(5, 7) * 50}
                    break;
                case 2:
                    s = {dx: randint(1, 4) * 0.01, length: randint(5, 7) * 50}
                    break;
                case 3:
                case 4:
                    s = {dx: 0, length: randint(3,6) * 100}
                    break;            
            }
            this.segments.push(s)        
        }
        // return track;
    }    


    // renders the road into the given image (usually the bg image from the scene)
    render(img: Image, wz: number, seg: number) {

        // draw ground
        img.fillRect(0, scene.screenHeight()-this.HORIZON, 160, this.HORIZON, GameColors.Ground);
        
        // do segment calculations    
        let curSegment = this.getSegment(seg);
        let nextSegment = this.getNextSegment(seg);
        let xCenter = scene.screenWidth() / 2; // initial center x
        let xShift = curSegment.dx; // track amount to shift xCenter per line

        // draw road (draw per line from the bottom up)    
        for(let y=0; y<this.HORIZON; y++) {            
            // load precomputed values for this line from our zMap cache
            let line = this.zMap[y]; // z, width, lineWidth, edgeWidth             
            let screenY = scene.screenHeight() - y - 1; // translate y to screen coords            
            let lineWorldZ = wz + line.z; // world z for this particular line
            let lineSegZ = gameData.segmentPos + line.z; // current segment z position for this line            
            let xf = line.z * 0.02; // exaggeration factor (makes turns more exciting)

            // determine which road stripe to use
            let stripe: RoadStripe;
            if (lineWorldZ % (this.STRIPE_SIZE * 2) >= this.STRIPE_SIZE) {
                // dark stripe
                stripe = GameColors.Stripes[0];
            } else {
                // light stripe
                stripe = GameColors.Stripes[1];
            }
            
            // curvature calculations
            // check if we should use the curve for the upcoming segment
            if (lineSegZ >= curSegment.length) {
                xShift += nextSegment.dx;
            } else {
                xShift += curSegment.dx;
            }
            // shift the center line based on the curvature
            xCenter += xShift * xf;
            
            // blit the line
            this.blitLine(img, xCenter, screenY, line, stripe, 3);
        }
    }

    // draws an individual to the screen
    blitLine(img: Image, xCenter: number, y: number, line: any, stripe: RoadStripe, lanes: number) {

        // calculate left and right extents of road
        let x1 = xCenter - line.width / 2;
        let x2 = xCenter + line.width / 2;        
        
        // draw ground 
        if (stripe.ground != GameColors.Ground)
            img.drawLine(0, y, 160, y, stripe.ground);

        // draw road surface
        img.drawLine(x1, y, x2, y, stripe.surface);

        // draw outside lines
        if (x1 > 0)
            img.drawLine(x1-line.edgeWidth, y, x1, y, stripe.sides);
        if (x2 < scene.screenWidth())
            img.drawLine(x2, y, x2+line.edgeWidth, y, stripe.sides);

        // draw inside lines
        if (stripe.lines != stripe.surface) {
            for (let n=1; n < lanes; n++) {
                let lineCenter = x1 + line.width * (n/lanes);
                img.drawLine(
                    lineCenter - line.lineWidth/2, y,
                    lineCenter + line.lineWidth/2, y,
                    stripe.lines
                );
            }
        }
    }
}