"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let lastUpdateTime = 0;
let startTime = 0;
/**
 * !#en The interface to get time information from Fireball.
 *
 * See [Time](/en/scripting/time/)
 * !#zh Time 模块用于获得游戏里的时间和帧率相关信息。直接使用 cc.Time.*** 访问即可。
 *
 * 请参考教程[计时和帧率](/zh/scripting/time/)
 *
 * @class Time
 * @static
 */
class Time {
    /**
     * The time at the beginning of this frame. This is the time in seconds since the start of the game.
     * @property time
     * @type {number}
     * @readOnly
     */
    time = 0;
    /**
     * The time at the beginning of this frame. This is the real time in seconds since the start of the game.
     *
     * `Time.realTime` not affected by time scale, and also keeps increasing while the player is paused in editor or in the background.
     * @property realTime
     * @type {number}
     * @readOnly
     */
    realTime = 0;
    /**
     * The time in seconds it took to complete the last frame. Use this property to make your game frame rate independent.
     * @property deltaTime
     * @type {number}
     * @readOnly
     */
    deltaTime = 0;
    /**
     * The total number of frames that have passed.
     * @property frameCount
     * @type {number}
     * @readOnly
     */
    frameCount = 0;
    /**
     * The maximum time a frame can take.
     * @property maxDeltaTime
     * @type {number}
     * @readOnly
     */
    maxDeltaTime = 0.3333333;
    /**
     * @method _update
     * @param {number} timestamp
     * @param {Boolean} [paused=false] if true, only realTime will be updated
     * @param {number} [maxDeltaTime=Time.maxDeltaTime]
     * @private
     */
    update(timestamp, paused, maxDeltaTime) {
        if (!paused) {
            maxDeltaTime = maxDeltaTime || this.maxDeltaTime;
            let delta = timestamp - lastUpdateTime;
            delta = Math.min(maxDeltaTime, delta);
            this.deltaTime = delta;
            lastUpdateTime = timestamp;
            if (this.frameCount === 0) {
                startTime = timestamp;
            }
            else {
                this.time += delta;
                this.realTime = timestamp - startTime;
            }
            ++this.frameCount;
        }
    }
    /**
     * @method _restart
     * @param {number} timestamp
     * @private
     */
    restart(timestamp) {
        this.time = 0;
        this.realTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;
        lastUpdateTime = timestamp;
    }
}
exports.default = new Time();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL3NjZW5lL3NjZW5lLXByb2Nlc3Mvc2VydmljZS9lbmdpbmUvdGltZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQztBQUN2QixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFFbEI7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sSUFBSTtJQUNOOzs7OztPQUtHO0lBQ0ksSUFBSSxHQUFHLENBQUMsQ0FBQztJQUVoQjs7Ozs7OztPQU9HO0lBQ0ksUUFBUSxHQUFHLENBQUMsQ0FBQztJQUVwQjs7Ozs7T0FLRztJQUNJLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFFckI7Ozs7O09BS0c7SUFDSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBRXRCOzs7OztPQUtHO0lBQ0ksWUFBWSxHQUFHLFNBQVMsQ0FBQztJQUVoQzs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQUMsU0FBaUIsRUFBRSxNQUFlLEVBQUUsWUFBb0I7UUFDbEUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ1YsWUFBWSxHQUFHLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQ2pELElBQUksS0FBSyxHQUFHLFNBQVMsR0FBRyxjQUFjLENBQUM7WUFDdkMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLGNBQWMsR0FBRyxTQUFTLENBQUM7WUFFM0IsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUN4QixTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzFCLENBQUM7aUJBQU0sQ0FBQztnQkFDSixJQUFJLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQztnQkFDbkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzFDLENBQUM7WUFDRCxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDdEIsQ0FBQztJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksT0FBTyxDQUFDLFNBQWlCO1FBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDcEIsY0FBYyxHQUFHLFNBQVMsQ0FBQztJQUMvQixDQUFDO0NBQ0o7QUFFRCxrQkFBZSxJQUFJLElBQUksRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsibGV0IGxhc3RVcGRhdGVUaW1lID0gMDtcclxubGV0IHN0YXJ0VGltZSA9IDA7XHJcblxyXG4vKipcclxuICogISNlbiBUaGUgaW50ZXJmYWNlIHRvIGdldCB0aW1lIGluZm9ybWF0aW9uIGZyb20gRmlyZWJhbGwuXHJcbiAqXHJcbiAqIFNlZSBbVGltZV0oL2VuL3NjcmlwdGluZy90aW1lLylcclxuICogISN6aCBUaW1lIOaooeWdl+eUqOS6juiOt+W+l+a4uOaIj+mHjOeahOaXtumXtOWSjOW4p+eOh+ebuOWFs+S/oeaBr+OAguebtOaOpeS9v+eUqCBjYy5UaW1lLioqKiDorr/pl67ljbPlj6/jgIJcclxuICpcclxuICog6K+35Y+C6ICD5pWZ56iLW+iuoeaXtuWSjOW4p+eOh10oL3poL3NjcmlwdGluZy90aW1lLylcclxuICpcclxuICogQGNsYXNzIFRpbWVcclxuICogQHN0YXRpY1xyXG4gKi9cclxuY2xhc3MgVGltZSB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0aW1lIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhpcyBmcmFtZS4gVGhpcyBpcyB0aGUgdGltZSBpbiBzZWNvbmRzIHNpbmNlIHRoZSBzdGFydCBvZiB0aGUgZ2FtZS5cclxuICAgICAqIEBwcm9wZXJ0eSB0aW1lXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICogQHJlYWRPbmx5XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0aW1lID0gMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0aW1lIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhpcyBmcmFtZS4gVGhpcyBpcyB0aGUgcmVhbCB0aW1lIGluIHNlY29uZHMgc2luY2UgdGhlIHN0YXJ0IG9mIHRoZSBnYW1lLlxyXG4gICAgICpcclxuICAgICAqIGBUaW1lLnJlYWxUaW1lYCBub3QgYWZmZWN0ZWQgYnkgdGltZSBzY2FsZSwgYW5kIGFsc28ga2VlcHMgaW5jcmVhc2luZyB3aGlsZSB0aGUgcGxheWVyIGlzIHBhdXNlZCBpbiBlZGl0b3Igb3IgaW4gdGhlIGJhY2tncm91bmQuXHJcbiAgICAgKiBAcHJvcGVydHkgcmVhbFRpbWVcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZE9ubHlcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlYWxUaW1lID0gMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0aW1lIGluIHNlY29uZHMgaXQgdG9vayB0byBjb21wbGV0ZSB0aGUgbGFzdCBmcmFtZS4gVXNlIHRoaXMgcHJvcGVydHkgdG8gbWFrZSB5b3VyIGdhbWUgZnJhbWUgcmF0ZSBpbmRlcGVuZGVudC5cclxuICAgICAqIEBwcm9wZXJ0eSBkZWx0YVRpbWVcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZE9ubHlcclxuICAgICAqL1xyXG4gICAgcHVibGljIGRlbHRhVGltZSA9IDA7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdG90YWwgbnVtYmVyIG9mIGZyYW1lcyB0aGF0IGhhdmUgcGFzc2VkLlxyXG4gICAgICogQHByb3BlcnR5IGZyYW1lQ291bnRcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKiBAcmVhZE9ubHlcclxuICAgICAqL1xyXG4gICAgcHVibGljIGZyYW1lQ291bnQgPSAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIG1heGltdW0gdGltZSBhIGZyYW1lIGNhbiB0YWtlLlxyXG4gICAgICogQHByb3BlcnR5IG1heERlbHRhVGltZVxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqIEByZWFkT25seVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbWF4RGVsdGFUaW1lID0gMC4zMzMzMzMzO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG1ldGhvZCBfdXBkYXRlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdGltZXN0YW1wXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtwYXVzZWQ9ZmFsc2VdIGlmIHRydWUsIG9ubHkgcmVhbFRpbWUgd2lsbCBiZSB1cGRhdGVkXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW21heERlbHRhVGltZT1UaW1lLm1heERlbHRhVGltZV1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB1cGRhdGUodGltZXN0YW1wOiBudW1iZXIsIHBhdXNlZDogYm9vbGVhbiwgbWF4RGVsdGFUaW1lOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoIXBhdXNlZCkge1xyXG4gICAgICAgICAgICBtYXhEZWx0YVRpbWUgPSBtYXhEZWx0YVRpbWUgfHwgdGhpcy5tYXhEZWx0YVRpbWU7XHJcbiAgICAgICAgICAgIGxldCBkZWx0YSA9IHRpbWVzdGFtcCAtIGxhc3RVcGRhdGVUaW1lO1xyXG4gICAgICAgICAgICBkZWx0YSA9IE1hdGgubWluKG1heERlbHRhVGltZSwgZGVsdGEpO1xyXG4gICAgICAgICAgICB0aGlzLmRlbHRhVGltZSA9IGRlbHRhO1xyXG4gICAgICAgICAgICBsYXN0VXBkYXRlVGltZSA9IHRpbWVzdGFtcDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmZyYW1lQ291bnQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSA9IHRpbWVzdGFtcDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudGltZSArPSBkZWx0YTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhbFRpbWUgPSB0aW1lc3RhbXAgLSBzdGFydFRpbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKyt0aGlzLmZyYW1lQ291bnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG1ldGhvZCBfcmVzdGFydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWVzdGFtcFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlc3RhcnQodGltZXN0YW1wOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnRpbWUgPSAwO1xyXG4gICAgICAgIHRoaXMucmVhbFRpbWUgPSAwO1xyXG4gICAgICAgIHRoaXMuZGVsdGFUaW1lID0gMDtcclxuICAgICAgICB0aGlzLmZyYW1lQ291bnQgPSAwO1xyXG4gICAgICAgIGxhc3RVcGRhdGVUaW1lID0gdGltZXN0YW1wO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBuZXcgVGltZSgpO1xyXG4iXX0=