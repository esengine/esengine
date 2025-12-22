/**
 * FairyGUI Module Initialization
 *
 * This module registers all object type creators with UIObjectFactory.
 * It must be imported after all classes are defined to break circular dependencies.
 *
 * FairyGUI 模块初始化，注册所有对象类型创建器以打破循环依赖
 */

import { UIObjectFactory } from './UIObjectFactory';
import { EObjectType } from './FieldTypes';
import { GGroup } from './GGroup';
import { GComponent } from './GComponent';
import { GImage } from '../widgets/GImage';
import { GGraph } from '../widgets/GGraph';
import { GTextField } from '../widgets/GTextField';
import { GTextInput } from '../widgets/GTextInput';
import { GButton } from '../widgets/GButton';
import { GProgressBar } from '../widgets/GProgressBar';
import { GSlider } from '../widgets/GSlider';
import { GMovieClip } from '../widgets/GMovieClip';
import { GLoader } from '../widgets/GLoader';

// Register all object type creators
UIObjectFactory.registerCreator(EObjectType.Image, () => new GImage());
UIObjectFactory.registerCreator(EObjectType.Graph, () => new GGraph());
UIObjectFactory.registerCreator(EObjectType.Text, () => new GTextField());
UIObjectFactory.registerCreator(EObjectType.RichText, () => new GTextField());
UIObjectFactory.registerCreator(EObjectType.InputText, () => new GTextInput());
UIObjectFactory.registerCreator(EObjectType.Group, () => new GGroup());
UIObjectFactory.registerCreator(EObjectType.Component, () => new GComponent());
UIObjectFactory.registerCreator(EObjectType.Button, () => new GButton());
UIObjectFactory.registerCreator(EObjectType.ProgressBar, () => new GProgressBar());
UIObjectFactory.registerCreator(EObjectType.Slider, () => new GSlider());
UIObjectFactory.registerCreator(EObjectType.MovieClip, () => new GMovieClip());
UIObjectFactory.registerCreator(EObjectType.Loader, () => new GLoader());

// Component-based types use GComponent as fallback (registered above)
// Label, ComboBox, List, Tree, ScrollBar, Swf, Loader3D
