'use strict';
module.exports = {
    options: {
        render_back_end: 'Render BackEnd',
        targetVersion: 'Target Version',
        executable_name: 'Executable Name',
        package_name: 'Bundle Identifier',
        package_name_hint: 'The package name, usually arranged in the reverse order of the product\'s website URL, such as: com.mycompany.myproduct.',
        skipUpdateXcodeProject: 'Skip the update of Xcode project',
        targetVersionDefault: 'Default: 10.14',
    },
    make: {
        label: 'Make',
    },
    run: {
        label: 'Run',
    },
    error: {
        m1_with_physic_x: 'Native PhysX does not support Apple Silicon',
        targetVersionError: 'The version number is invalid, example: 10.14',
        packageNameRuleMessage: 'The bundle ID string must contain only alphanumeric characters (A–Z, a–z, and 0–9), hyphens (-), and periods (.). Typically, you use a reverse-DNS format for bundle ID strings. ',
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3BsYXRmb3Jtcy9tYWMvaTE4bi9lbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7QUFFYixNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsT0FBTyxFQUFFO1FBQ0wsZUFBZSxFQUFFLGdCQUFnQjtRQUNqQyxhQUFhLEVBQUUsZ0JBQWdCO1FBQy9CLGVBQWUsRUFBRSxpQkFBaUI7UUFDbEMsWUFBWSxFQUFFLG1CQUFtQjtRQUNqQyxpQkFBaUIsRUFDYiwwSEFBMEg7UUFDOUgsc0JBQXNCLEVBQUUsa0NBQWtDO1FBQzFELG9CQUFvQixFQUFFLGdCQUFnQjtLQUN6QztJQUNELElBQUksRUFBRTtRQUNGLEtBQUssRUFBRSxNQUFNO0tBQ2hCO0lBQ0QsR0FBRyxFQUFFO1FBQ0QsS0FBSyxFQUFFLEtBQUs7S0FDZjtJQUNELEtBQUssRUFBRTtRQUNILGdCQUFnQixFQUFFLDZDQUE2QztRQUMvRCxrQkFBa0IsRUFBRSwrQ0FBK0M7UUFDbkUsc0JBQXNCLEVBQ2xCLG1MQUFtTDtLQUMxTDtDQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgICByZW5kZXJfYmFja19lbmQ6ICdSZW5kZXIgQmFja0VuZCcsXHJcbiAgICAgICAgdGFyZ2V0VmVyc2lvbjogJ1RhcmdldCBWZXJzaW9uJyxcclxuICAgICAgICBleGVjdXRhYmxlX25hbWU6ICdFeGVjdXRhYmxlIE5hbWUnLFxyXG4gICAgICAgIHBhY2thZ2VfbmFtZTogJ0J1bmRsZSBJZGVudGlmaWVyJyxcclxuICAgICAgICBwYWNrYWdlX25hbWVfaGludDpcclxuICAgICAgICAgICAgJ1RoZSBwYWNrYWdlIG5hbWUsIHVzdWFsbHkgYXJyYW5nZWQgaW4gdGhlIHJldmVyc2Ugb3JkZXIgb2YgdGhlIHByb2R1Y3RcXCdzIHdlYnNpdGUgVVJMLCBzdWNoIGFzOiBjb20ubXljb21wYW55Lm15cHJvZHVjdC4nLFxyXG4gICAgICAgIHNraXBVcGRhdGVYY29kZVByb2plY3Q6ICdTa2lwIHRoZSB1cGRhdGUgb2YgWGNvZGUgcHJvamVjdCcsXHJcbiAgICAgICAgdGFyZ2V0VmVyc2lvbkRlZmF1bHQ6ICdEZWZhdWx0OiAxMC4xNCcsXHJcbiAgICB9LFxyXG4gICAgbWFrZToge1xyXG4gICAgICAgIGxhYmVsOiAnTWFrZScsXHJcbiAgICB9LFxyXG4gICAgcnVuOiB7XHJcbiAgICAgICAgbGFiZWw6ICdSdW4nLFxyXG4gICAgfSxcclxuICAgIGVycm9yOiB7XHJcbiAgICAgICAgbTFfd2l0aF9waHlzaWNfeDogJ05hdGl2ZSBQaHlzWCBkb2VzIG5vdCBzdXBwb3J0IEFwcGxlIFNpbGljb24nLFxyXG4gICAgICAgIHRhcmdldFZlcnNpb25FcnJvcjogJ1RoZSB2ZXJzaW9uIG51bWJlciBpcyBpbnZhbGlkLCBleGFtcGxlOiAxMC4xNCcsXHJcbiAgICAgICAgcGFja2FnZU5hbWVSdWxlTWVzc2FnZTpcclxuICAgICAgICAgICAgJ1RoZSBidW5kbGUgSUQgc3RyaW5nIG11c3QgY29udGFpbiBvbmx5IGFscGhhbnVtZXJpYyBjaGFyYWN0ZXJzIChB4oCTWiwgYeKAk3osIGFuZCAw4oCTOSksIGh5cGhlbnMgKC0pLCBhbmQgcGVyaW9kcyAoLikuIFR5cGljYWxseSwgeW91IHVzZSBhIHJldmVyc2UtRE5TIGZvcm1hdCBmb3IgYnVuZGxlIElEIHN0cmluZ3MuICcsXHJcbiAgICB9LFxyXG59O1xyXG4iXX0=