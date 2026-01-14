"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestGlobalEnv = void 0;
const path_1 = require("path");
const projectRoot = (0, path_1.join)(__dirname, '../../tests/fixtures/projects/asset-operation');
exports.TestGlobalEnv = {
    projectRoot,
    engineRoot: (0, path_1.join)(__dirname, '../../packages/engine'),
    libraryPath: (0, path_1.join)(projectRoot, 'library'),
    testRootUrl: 'db://assets/__test__',
    testRoot: (0, path_1.join)(projectRoot, 'assets/__test__'),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsLWVudi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0cy9nbG9iYWwtZW52LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtCQUE0QjtBQUU1QixNQUFNLFdBQVcsR0FBRyxJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUsK0NBQStDLENBQUMsQ0FBQztBQUV4RSxRQUFBLGFBQWEsR0FBRztJQUN6QixXQUFXO0lBQ1gsVUFBVSxFQUFFLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSx1QkFBdUIsQ0FBQztJQUNwRCxXQUFXLEVBQUUsSUFBQSxXQUFJLEVBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQztJQUN6QyxXQUFXLEVBQUUsc0JBQXNCO0lBQ25DLFFBQVEsRUFBRSxJQUFBLFdBQUksRUFBQyxXQUFXLEVBQUUsaUJBQWlCLENBQUM7Q0FDakQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcclxuXHJcbmNvbnN0IHByb2plY3RSb290ID0gam9pbihfX2Rpcm5hbWUsICcuLi8uLi90ZXN0cy9maXh0dXJlcy9wcm9qZWN0cy9hc3NldC1vcGVyYXRpb24nKTtcclxuXHJcbmV4cG9ydCBjb25zdCBUZXN0R2xvYmFsRW52ID0ge1xyXG4gICAgcHJvamVjdFJvb3QsXHJcbiAgICBlbmdpbmVSb290OiBqb2luKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL2VuZ2luZScpLFxyXG4gICAgbGlicmFyeVBhdGg6IGpvaW4ocHJvamVjdFJvb3QsICdsaWJyYXJ5JyksXHJcbiAgICB0ZXN0Um9vdFVybDogJ2RiOi8vYXNzZXRzL19fdGVzdF9fJyxcclxuICAgIHRlc3RSb290OiBqb2luKHByb2plY3RSb290LCAnYXNzZXRzL19fdGVzdF9fJyksXHJcbn07XHJcbiJdfQ==