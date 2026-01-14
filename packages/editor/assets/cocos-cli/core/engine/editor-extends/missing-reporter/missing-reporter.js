'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingReporter = void 0;
class MissingReporter {
    outputLevel = 'debug';
    static INFO_DETAILED = ' Detailed information:\n';
    static getObjectType(obj) {
        // @ts-ignore
        if (obj instanceof cc.Component) {
            return 'component';
            // @ts-ignore
        }
        else if (obj instanceof cc.Prefab) {
            return 'prefab';
            // @ts-ignore
        }
        else if (obj instanceof cc.SceneAsset) {
            return 'scene';
        }
        else {
            return 'asset';
        }
    }
    // 这个属性用于 stash 和 report
    missingObjects = new Set();
    // 这个属性用于 stashByOwner 和 reportByOwner
    missingOwners = new Map();
    root;
    report() { }
    reportByOwner() { }
    constructor(root) {
        this.root = root;
    }
    reset() {
        this.missingObjects.clear();
        this.missingOwners.clear();
        this.root = null;
    }
    stash(obj) {
        this.missingObjects.add(obj);
    }
    /**
     * stashByOwner 和 stash 的区别在于，stash 要求对象中有值，stashByOwner 允许对象的值为空
     * @param {any} [value] - 如果 value 未设置，不会影响提示信息，只不过提示信息可能会不够详细
     */
    stashByOwner(owner, propName, value) {
        let props = this.missingOwners.get(owner);
        if (!props) {
            props = {};
            this.missingOwners.set(owner, props);
        }
        props[propName] = value;
    }
    removeStashedByOwner(owner, propName) {
        const props = this.missingOwners.get(owner);
        if (props) {
            if (propName in props) {
                const id = props[propName];
                delete props[propName];
                if (Object.keys(props).length) {
                    return id;
                }
                // for (var k in props) {
                //     // still has props
                //     return id;
                // }
                // empty
                this.missingOwners.delete(owner);
                return id;
            }
        }
        return undefined;
    }
}
exports.MissingReporter = MissingReporter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlzc2luZy1yZXBvcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2VuZ2luZS9lZGl0b3ItZXh0ZW5kcy9taXNzaW5nLXJlcG9ydGVyL21pc3NpbmctcmVwb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYixNQUFhLGVBQWU7SUFFeEIsV0FBVyxHQUErQixPQUFPLENBQUM7SUFFbEQsTUFBTSxDQUFDLGFBQWEsR0FBRywwQkFBMEIsQ0FBQztJQUVsRCxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQVE7UUFDekIsYUFBYTtRQUNiLElBQUksR0FBRyxZQUFZLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUM5QixPQUFPLFdBQVcsQ0FBQztZQUNuQixhQUFhO1FBQ2pCLENBQUM7YUFBTSxJQUFJLEdBQUcsWUFBWSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEMsT0FBTyxRQUFRLENBQUM7WUFDaEIsYUFBYTtRQUNqQixDQUFDO2FBQU0sSUFBSSxHQUFHLFlBQVksRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3RDLE9BQU8sT0FBTyxDQUFDO1FBQ25CLENBQUM7YUFBTSxDQUFDO1lBQ0osT0FBTyxPQUFPLENBQUM7UUFDbkIsQ0FBQztJQUNMLENBQUM7SUFFRCx3QkFBd0I7SUFDeEIsY0FBYyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUFFM0Isc0NBQXNDO0lBQ3RDLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBRTFCLElBQUksQ0FBTTtJQUVWLE1BQU0sS0FBSyxDQUFDO0lBQ1osYUFBYSxLQUFLLENBQUM7SUFFbkIsWUFBWSxJQUFVO1FBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxLQUFLO1FBQ0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxLQUFLLENBQUMsR0FBUTtRQUNWLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxZQUFZLENBQUMsS0FBVSxFQUFFLFFBQWEsRUFBRSxLQUFVO1FBQzlDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNULEtBQUssR0FBRyxFQUFFLENBQUM7WUFDWCxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUNELEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDNUIsQ0FBQztJQUVELG9CQUFvQixDQUFDLEtBQVUsRUFBRSxRQUFhO1FBQzFDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVDLElBQUksS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLFFBQVEsSUFBSSxLQUFLLEVBQUUsQ0FBQztnQkFDcEIsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMzQixPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdkIsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUM1QixPQUFPLEVBQUUsQ0FBQztnQkFDZCxDQUFDO2dCQUNELHlCQUF5QjtnQkFDekIseUJBQXlCO2dCQUN6QixpQkFBaUI7Z0JBQ2pCLElBQUk7Z0JBQ0osUUFBUTtnQkFDUixJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDakMsT0FBTyxFQUFFLENBQUM7WUFDZCxDQUFDO1FBQ0wsQ0FBQztRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7O0FBOUVMLDBDQStFQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmV4cG9ydCBjbGFzcyBNaXNzaW5nUmVwb3J0ZXIge1xyXG5cclxuICAgIG91dHB1dExldmVsOiAnZGVidWcnIHwgJ3dhcm4nIHwgJ2Vycm9yJyA9ICdkZWJ1Zyc7XHJcblxyXG4gICAgc3RhdGljIElORk9fREVUQUlMRUQgPSAnIERldGFpbGVkIGluZm9ybWF0aW9uOlxcbic7XHJcblxyXG4gICAgc3RhdGljIGdldE9iamVjdFR5cGUob2JqOiBhbnkpIHtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIGNjLkNvbXBvbmVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ2NvbXBvbmVudCc7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICB9IGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIGNjLlByZWZhYikge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3ByZWZhYic7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICB9IGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIGNjLlNjZW5lQXNzZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdzY2VuZSc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuICdhc3NldCc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIOi/meS4quWxnuaAp+eUqOS6jiBzdGFzaCDlkowgcmVwb3J0XHJcbiAgICBtaXNzaW5nT2JqZWN0cyA9IG5ldyBTZXQoKTtcclxuXHJcbiAgICAvLyDov5nkuKrlsZ7mgKfnlKjkuo4gc3Rhc2hCeU93bmVyIOWSjCByZXBvcnRCeU93bmVyXHJcbiAgICBtaXNzaW5nT3duZXJzID0gbmV3IE1hcCgpO1xyXG5cclxuICAgIHJvb3Q6IGFueTtcclxuXHJcbiAgICByZXBvcnQoKSB7IH1cclxuICAgIHJlcG9ydEJ5T3duZXIoKSB7IH1cclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihyb290PzogYW55KSB7XHJcbiAgICAgICAgdGhpcy5yb290ID0gcm9vdDtcclxuICAgIH1cclxuXHJcbiAgICByZXNldCgpIHtcclxuICAgICAgICB0aGlzLm1pc3NpbmdPYmplY3RzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5taXNzaW5nT3duZXJzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5yb290ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdGFzaChvYmo6IGFueSkge1xyXG4gICAgICAgIHRoaXMubWlzc2luZ09iamVjdHMuYWRkKG9iaik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzdGFzaEJ5T3duZXIg5ZKMIHN0YXNoIOeahOWMuuWIq+WcqOS6ju+8jHN0YXNoIOimgeaxguWvueixoeS4reacieWAvO+8jHN0YXNoQnlPd25lciDlhYHorrjlr7nosaHnmoTlgLzkuLrnqbpcclxuICAgICAqIEBwYXJhbSB7YW55fSBbdmFsdWVdIC0g5aaC5p6cIHZhbHVlIOacquiuvue9ru+8jOS4jeS8muW9seWTjeaPkOekuuS/oeaBr++8jOWPquS4jei/h+aPkOekuuS/oeaBr+WPr+iDveS8muS4jeWkn+ivpue7hlxyXG4gICAgICovXHJcbiAgICBzdGFzaEJ5T3duZXIob3duZXI6IGFueSwgcHJvcE5hbWU6IGFueSwgdmFsdWU6IGFueSkge1xyXG4gICAgICAgIGxldCBwcm9wcyA9IHRoaXMubWlzc2luZ093bmVycy5nZXQob3duZXIpO1xyXG4gICAgICAgIGlmICghcHJvcHMpIHtcclxuICAgICAgICAgICAgcHJvcHMgPSB7fTtcclxuICAgICAgICAgICAgdGhpcy5taXNzaW5nT3duZXJzLnNldChvd25lciwgcHJvcHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm9wc1twcm9wTmFtZV0gPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVTdGFzaGVkQnlPd25lcihvd25lcjogYW55LCBwcm9wTmFtZTogYW55KSB7XHJcbiAgICAgICAgY29uc3QgcHJvcHMgPSB0aGlzLm1pc3NpbmdPd25lcnMuZ2V0KG93bmVyKTtcclxuICAgICAgICBpZiAocHJvcHMpIHtcclxuICAgICAgICAgICAgaWYgKHByb3BOYW1lIGluIHByb3BzKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IHByb3BzW3Byb3BOYW1lXTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBwcm9wc1twcm9wTmFtZV07XHJcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMocHJvcHMpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGZvciAodmFyIGsgaW4gcHJvcHMpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBzdGlsbCBoYXMgcHJvcHNcclxuICAgICAgICAgICAgICAgIC8vICAgICByZXR1cm4gaWQ7XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAvLyBlbXB0eVxyXG4gICAgICAgICAgICAgICAgdGhpcy5taXNzaW5nT3duZXJzLmRlbGV0ZShvd25lcik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxufVxyXG4iXX0=