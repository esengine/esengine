export declare function evaluateValueTangent(time: number, fromTime: number, fromValue: number, fromTangentX: number, fromTangentY: number, toTime: number, toValue: number, toTangentX: number, toTangentY: number): {
    value: number;
    tangent: {
        x: number;
        y: number;
    };
};
/**
 * Solve Cubic Equation using Cardano's formula.
 * The equation is formed from coeff0 + coeff1 * x + coeff2 * x^2 + coeff3 * x^3 = 0.
 * Modified from https://github.com/erich666/GraphicsGems/blob/master/gems/Roots3And4.c .
 */
export declare function solveCubic(coeff0: number, coeff1: number, coeff2: number, coeff3: number, solutions: [number, number, number]): number;
