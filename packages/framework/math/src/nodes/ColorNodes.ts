/**
 * @zh 颜色蓝图节点
 * @en Color Blueprint Nodes
 */

import type { BlueprintNodeTemplate, BlueprintNode, INodeExecutor, ExecutionResult } from '@esengine/blueprint';
import { Color } from '../Color';

interface ColorContext {
    evaluateInput(nodeId: string, pinName: string, defaultValue?: unknown): unknown;
}

// Make Color from RGBA
export const MakeColorTemplate: BlueprintNodeTemplate = {
    type: 'MakeColor',
    title: 'Make Color',
    category: 'math',
    description: 'Creates a Color from RGBA',
    keywords: ['make', 'create', 'color', 'rgba'],
    menuPath: ['Math', 'Color', 'Make Color'],
    isPure: true,
    inputs: [
        { name: 'r', displayName: 'R (0-255)', type: 'int', defaultValue: 255 },
        { name: 'g', displayName: 'G (0-255)', type: 'int', defaultValue: 255 },
        { name: 'b', displayName: 'B (0-255)', type: 'int', defaultValue: 255 },
        { name: 'a', displayName: 'A (0-1)', type: 'float', defaultValue: 1 }
    ],
    outputs: [
        { name: 'color', displayName: 'Color', type: 'color' }
    ],
    color: '#E91E63'
};

export class MakeColorExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ColorContext;
        const r = Number(ctx.evaluateInput(node.id, 'r', 255));
        const g = Number(ctx.evaluateInput(node.id, 'g', 255));
        const b = Number(ctx.evaluateInput(node.id, 'b', 255));
        const a = Number(ctx.evaluateInput(node.id, 'a', 1));
        return { outputs: { color: new Color(r, g, b, a) } };
    }
}

// Break Color
export const BreakColorTemplate: BlueprintNodeTemplate = {
    type: 'BreakColor',
    title: 'Break Color',
    category: 'math',
    description: 'Breaks a Color into RGBA',
    keywords: ['break', 'split', 'color', 'rgba'],
    menuPath: ['Math', 'Color', 'Break Color'],
    isPure: true,
    inputs: [
        { name: 'color', displayName: 'Color', type: 'color' }
    ],
    outputs: [
        { name: 'r', displayName: 'R', type: 'int' },
        { name: 'g', displayName: 'G', type: 'int' },
        { name: 'b', displayName: 'B', type: 'int' },
        { name: 'a', displayName: 'A', type: 'float' }
    ],
    color: '#E91E63'
};

export class BreakColorExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ColorContext;
        const color = ctx.evaluateInput(node.id, 'color', Color.WHITE) as Color;
        const c = color ?? Color.WHITE;
        return { outputs: { r: c.r, g: c.g, b: c.b, a: c.a } };
    }
}

// Color from Hex
export const ColorFromHexTemplate: BlueprintNodeTemplate = {
    type: 'ColorFromHex',
    title: 'Color From Hex',
    category: 'math',
    description: 'Creates a Color from hex string',
    keywords: ['color', 'hex', 'from', 'create'],
    menuPath: ['Math', 'Color', 'From Hex'],
    isPure: true,
    inputs: [
        { name: 'hex', displayName: 'Hex', type: 'string', defaultValue: '#FFFFFF' },
        { name: 'alpha', displayName: 'Alpha', type: 'float', defaultValue: 1 }
    ],
    outputs: [
        { name: 'color', displayName: 'Color', type: 'color' }
    ],
    color: '#E91E63'
};

export class ColorFromHexExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ColorContext;
        const hex = String(ctx.evaluateInput(node.id, 'hex', '#FFFFFF'));
        const alpha = Number(ctx.evaluateInput(node.id, 'alpha', 1));
        return { outputs: { color: Color.fromHex(hex, alpha) } };
    }
}

// Color to Hex
export const ColorToHexTemplate: BlueprintNodeTemplate = {
    type: 'ColorToHex',
    title: 'Color To Hex',
    category: 'math',
    description: 'Converts a Color to hex string',
    keywords: ['color', 'hex', 'to', 'convert'],
    menuPath: ['Math', 'Color', 'To Hex'],
    isPure: true,
    inputs: [
        { name: 'color', displayName: 'Color', type: 'color' }
    ],
    outputs: [
        { name: 'hex', displayName: 'Hex', type: 'string' }
    ],
    color: '#E91E63'
};

export class ColorToHexExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ColorContext;
        const color = ctx.evaluateInput(node.id, 'color', Color.WHITE) as Color;
        return { outputs: { hex: (color ?? Color.WHITE).toHex() } };
    }
}

// Color from HSL
export const ColorFromHSLTemplate: BlueprintNodeTemplate = {
    type: 'ColorFromHSL',
    title: 'Color From HSL',
    category: 'math',
    description: 'Creates a Color from HSL values',
    keywords: ['color', 'hsl', 'hue', 'saturation', 'lightness'],
    menuPath: ['Math', 'Color', 'From HSL'],
    isPure: true,
    inputs: [
        { name: 'h', displayName: 'H (0-360)', type: 'float', defaultValue: 0 },
        { name: 's', displayName: 'S (0-1)', type: 'float', defaultValue: 1 },
        { name: 'l', displayName: 'L (0-1)', type: 'float', defaultValue: 0.5 },
        { name: 'a', displayName: 'A (0-1)', type: 'float', defaultValue: 1 }
    ],
    outputs: [
        { name: 'color', displayName: 'Color', type: 'color' }
    ],
    color: '#E91E63'
};

export class ColorFromHSLExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ColorContext;
        const h = Number(ctx.evaluateInput(node.id, 'h', 0));
        const s = Number(ctx.evaluateInput(node.id, 's', 1));
        const l = Number(ctx.evaluateInput(node.id, 'l', 0.5));
        const a = Number(ctx.evaluateInput(node.id, 'a', 1));
        return { outputs: { color: Color.fromHSL(h, s, l, a) } };
    }
}

// Color to HSL
export const ColorToHSLTemplate: BlueprintNodeTemplate = {
    type: 'ColorToHSL',
    title: 'Color To HSL',
    category: 'math',
    description: 'Converts a Color to HSL values',
    keywords: ['color', 'hsl', 'convert'],
    menuPath: ['Math', 'Color', 'To HSL'],
    isPure: true,
    inputs: [
        { name: 'color', displayName: 'Color', type: 'color' }
    ],
    outputs: [
        { name: 'h', displayName: 'H', type: 'float' },
        { name: 's', displayName: 'S', type: 'float' },
        { name: 'l', displayName: 'L', type: 'float' }
    ],
    color: '#E91E63'
};

export class ColorToHSLExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ColorContext;
        const color = ctx.evaluateInput(node.id, 'color', Color.WHITE) as Color;
        const hsl = (color ?? Color.WHITE).toHSL();
        return { outputs: { h: hsl.h, s: hsl.s, l: hsl.l } };
    }
}

// Color Lerp
export const ColorLerpTemplate: BlueprintNodeTemplate = {
    type: 'ColorLerp',
    title: 'Color Lerp',
    category: 'math',
    description: 'Linear interpolation between two colors',
    keywords: ['color', 'lerp', 'interpolate', 'blend'],
    menuPath: ['Math', 'Color', 'Lerp'],
    isPure: true,
    inputs: [
        { name: 'from', displayName: 'From', type: 'color' },
        { name: 'to', displayName: 'To', type: 'color' },
        { name: 't', displayName: 'T', type: 'float', defaultValue: 0.5 }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'color' }
    ],
    color: '#E91E63'
};

export class ColorLerpExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ColorContext;
        const from = ctx.evaluateInput(node.id, 'from', Color.BLACK) as Color;
        const to = ctx.evaluateInput(node.id, 'to', Color.WHITE) as Color;
        const t = Number(ctx.evaluateInput(node.id, 't', 0.5));
        return { outputs: { result: Color.lerp(from ?? Color.BLACK, to ?? Color.WHITE, t) } };
    }
}

// Color Lighten
export const ColorLightenTemplate: BlueprintNodeTemplate = {
    type: 'ColorLighten',
    title: 'Color Lighten',
    category: 'math',
    description: 'Lightens a color',
    keywords: ['color', 'lighten', 'bright'],
    menuPath: ['Math', 'Color', 'Lighten'],
    isPure: true,
    inputs: [
        { name: 'color', displayName: 'Color', type: 'color' },
        { name: 'amount', displayName: 'Amount', type: 'float', defaultValue: 0.1 }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'color' }
    ],
    color: '#E91E63'
};

export class ColorLightenExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ColorContext;
        const color = ctx.evaluateInput(node.id, 'color', Color.GRAY) as Color;
        const amount = Number(ctx.evaluateInput(node.id, 'amount', 0.1));
        return { outputs: { result: Color.lighten(color ?? Color.GRAY, amount) } };
    }
}

// Color Darken
export const ColorDarkenTemplate: BlueprintNodeTemplate = {
    type: 'ColorDarken',
    title: 'Color Darken',
    category: 'math',
    description: 'Darkens a color',
    keywords: ['color', 'darken', 'dark'],
    menuPath: ['Math', 'Color', 'Darken'],
    isPure: true,
    inputs: [
        { name: 'color', displayName: 'Color', type: 'color' },
        { name: 'amount', displayName: 'Amount', type: 'float', defaultValue: 0.1 }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'color' }
    ],
    color: '#E91E63'
};

export class ColorDarkenExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ColorContext;
        const color = ctx.evaluateInput(node.id, 'color', Color.GRAY) as Color;
        const amount = Number(ctx.evaluateInput(node.id, 'amount', 0.1));
        return { outputs: { result: Color.darken(color ?? Color.GRAY, amount) } };
    }
}

// Color Saturate
export const ColorSaturateTemplate: BlueprintNodeTemplate = {
    type: 'ColorSaturate',
    title: 'Color Saturate',
    category: 'math',
    description: 'Increases color saturation',
    keywords: ['color', 'saturate', 'saturation'],
    menuPath: ['Math', 'Color', 'Saturate'],
    isPure: true,
    inputs: [
        { name: 'color', displayName: 'Color', type: 'color' },
        { name: 'amount', displayName: 'Amount', type: 'float', defaultValue: 0.1 }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'color' }
    ],
    color: '#E91E63'
};

export class ColorSaturateExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ColorContext;
        const color = ctx.evaluateInput(node.id, 'color', Color.GRAY) as Color;
        const amount = Number(ctx.evaluateInput(node.id, 'amount', 0.1));
        return { outputs: { result: Color.saturate(color ?? Color.GRAY, amount) } };
    }
}

// Color Desaturate
export const ColorDesaturateTemplate: BlueprintNodeTemplate = {
    type: 'ColorDesaturate',
    title: 'Color Desaturate',
    category: 'math',
    description: 'Decreases color saturation',
    keywords: ['color', 'desaturate', 'saturation'],
    menuPath: ['Math', 'Color', 'Desaturate'],
    isPure: true,
    inputs: [
        { name: 'color', displayName: 'Color', type: 'color' },
        { name: 'amount', displayName: 'Amount', type: 'float', defaultValue: 0.1 }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'color' }
    ],
    color: '#E91E63'
};

export class ColorDesaturateExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ColorContext;
        const color = ctx.evaluateInput(node.id, 'color', Color.GRAY) as Color;
        const amount = Number(ctx.evaluateInput(node.id, 'amount', 0.1));
        return { outputs: { result: Color.desaturate(color ?? Color.GRAY, amount) } };
    }
}

// Color Invert
export const ColorInvertTemplate: BlueprintNodeTemplate = {
    type: 'ColorInvert',
    title: 'Color Invert',
    category: 'math',
    description: 'Inverts a color',
    keywords: ['color', 'invert', 'inverse'],
    menuPath: ['Math', 'Color', 'Invert'],
    isPure: true,
    inputs: [
        { name: 'color', displayName: 'Color', type: 'color' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'color' }
    ],
    color: '#E91E63'
};

export class ColorInvertExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ColorContext;
        const color = ctx.evaluateInput(node.id, 'color', Color.WHITE) as Color;
        return { outputs: { result: Color.invert(color ?? Color.WHITE) } };
    }
}

// Color Grayscale
export const ColorGrayscaleTemplate: BlueprintNodeTemplate = {
    type: 'ColorGrayscale',
    title: 'Color Grayscale',
    category: 'math',
    description: 'Converts color to grayscale',
    keywords: ['color', 'grayscale', 'gray', 'grey'],
    menuPath: ['Math', 'Color', 'Grayscale'],
    isPure: true,
    inputs: [
        { name: 'color', displayName: 'Color', type: 'color' }
    ],
    outputs: [
        { name: 'result', displayName: 'Result', type: 'color' }
    ],
    color: '#E91E63'
};

export class ColorGrayscaleExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ColorContext;
        const color = ctx.evaluateInput(node.id, 'color', Color.WHITE) as Color;
        return { outputs: { result: Color.grayscale(color ?? Color.WHITE) } };
    }
}

// Color Luminance
export const ColorLuminanceTemplate: BlueprintNodeTemplate = {
    type: 'ColorLuminance',
    title: 'Color Luminance',
    category: 'math',
    description: 'Gets perceived brightness (0-1)',
    keywords: ['color', 'luminance', 'brightness'],
    menuPath: ['Math', 'Color', 'Luminance'],
    isPure: true,
    inputs: [
        { name: 'color', displayName: 'Color', type: 'color' }
    ],
    outputs: [
        { name: 'luminance', displayName: 'Luminance', type: 'float' }
    ],
    color: '#E91E63'
};

export class ColorLuminanceExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: unknown): ExecutionResult {
        const ctx = context as ColorContext;
        const color = ctx.evaluateInput(node.id, 'color', Color.WHITE) as Color;
        return { outputs: { luminance: Color.luminance(color ?? Color.WHITE) } };
    }
}

// Color Constants
export const ColorConstantsTemplate: BlueprintNodeTemplate = {
    type: 'ColorConstants',
    title: 'Color Constants',
    category: 'math',
    description: 'Common color constants',
    keywords: ['color', 'constant', 'red', 'green', 'blue', 'white', 'black'],
    menuPath: ['Math', 'Color', 'Constants'],
    isPure: true,
    inputs: [],
    outputs: [
        { name: 'white', displayName: 'White', type: 'color' },
        { name: 'black', displayName: 'Black', type: 'color' },
        { name: 'red', displayName: 'Red', type: 'color' },
        { name: 'green', displayName: 'Green', type: 'color' },
        { name: 'blue', displayName: 'Blue', type: 'color' },
        { name: 'transparent', displayName: 'Transparent', type: 'color' }
    ],
    color: '#E91E63'
};

export class ColorConstantsExecutor implements INodeExecutor {
    execute(): ExecutionResult {
        return {
            outputs: {
                white: Color.WHITE,
                black: Color.BLACK,
                red: Color.RED,
                green: Color.GREEN,
                blue: Color.BLUE,
                transparent: Color.TRANSPARENT
            }
        };
    }
}

// Node definitions collection
export const ColorNodeDefinitions = [
    { template: MakeColorTemplate, executor: new MakeColorExecutor() },
    { template: BreakColorTemplate, executor: new BreakColorExecutor() },
    { template: ColorFromHexTemplate, executor: new ColorFromHexExecutor() },
    { template: ColorToHexTemplate, executor: new ColorToHexExecutor() },
    { template: ColorFromHSLTemplate, executor: new ColorFromHSLExecutor() },
    { template: ColorToHSLTemplate, executor: new ColorToHSLExecutor() },
    { template: ColorLerpTemplate, executor: new ColorLerpExecutor() },
    { template: ColorLightenTemplate, executor: new ColorLightenExecutor() },
    { template: ColorDarkenTemplate, executor: new ColorDarkenExecutor() },
    { template: ColorSaturateTemplate, executor: new ColorSaturateExecutor() },
    { template: ColorDesaturateTemplate, executor: new ColorDesaturateExecutor() },
    { template: ColorInvertTemplate, executor: new ColorInvertExecutor() },
    { template: ColorGrayscaleTemplate, executor: new ColorGrayscaleExecutor() },
    { template: ColorLuminanceTemplate, executor: new ColorLuminanceExecutor() },
    { template: ColorConstantsTemplate, executor: new ColorConstantsExecutor() }
];
