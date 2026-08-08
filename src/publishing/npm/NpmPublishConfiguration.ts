import type { NpmPublishSettings } from './NpmPublishSettings';
import { InvalidNpmPublishConfigurationError } from './exceptions/InvalidNpmPublishConfigurationError';
import type { NpmPackageOverride } from './NpmPackageOverride';
import { PackageName } from '../../release/PackageName';


export class NpmPublishConfiguration {
    private static _createValidatedSettings(settings: NpmPublishSettings): NpmPublishSettings {
        NpmPublishConfiguration._assertNotEmpty('nodeVersion', settings.nodeVersion);
        NpmPublishConfiguration._assertNotEmpty('packageDirectory', settings.packageDirectory);
        NpmPublishConfiguration._assertNotEmpty('deployCommand', settings.deployCommand);

        return { ...settings };
    }

    private static _assertNotEmpty(propertyName: keyof NpmPublishSettings, value: string): void {
        if (value.length === 0) {
            throw new InvalidNpmPublishConfigurationError(propertyName);
        }
    }

    private static _useOverride(overrideValue: string | undefined, defaultValue: string): string {
        if (overrideValue === undefined || overrideValue.length === 0) {
            return defaultValue;
        }

        return overrideValue;
    }

    private readonly _defaults: NpmPublishSettings;
    private readonly _packageOverrides: ReadonlyMap<string, NpmPackageOverride>;

    public constructor(
        defaults: NpmPublishSettings,
        packageOverrides: Readonly<Record<string, NpmPackageOverride>> = {},
    ) {
        this._defaults = NpmPublishConfiguration._createValidatedSettings(defaults);

        const normalizedOverrides: Map<string, NpmPackageOverride> = new Map<string, NpmPackageOverride>();
        const packageOverrideEntries: [string, NpmPackageOverride][] = Object.entries(packageOverrides);

        packageOverrideEntries.forEach((packageOverrideEntry: [string, NpmPackageOverride]): void => {
            const packageNameValue: string = packageOverrideEntry[0];
            const packageOverride: NpmPackageOverride = packageOverrideEntry[1];
            const packageName: PackageName = PackageName.parse(packageNameValue);

            normalizedOverrides.set(packageName.value, { ...packageOverride });
        });

        this._packageOverrides = normalizedOverrides;
    }

    public resolve(packageName: PackageName | null): NpmPublishSettings {
        if (packageName === null) {
            return { ...this._defaults };
        }

        const packageOverride: NpmPackageOverride | undefined = this._packageOverrides.get(packageName.value);

        if (packageOverride === undefined) {
            return { ...this._defaults };
        }

        const resolvedSettings: NpmPublishSettings = {
            nodeVersion: NpmPublishConfiguration._useOverride(packageOverride.nodeVersion, this._defaults.nodeVersion),
            packageDirectory: NpmPublishConfiguration._useOverride(
                packageOverride.packageDirectory,
                this._defaults.packageDirectory,
            ),
            deployCommand: NpmPublishConfiguration._useOverride(
                packageOverride.deployCommand,
                this._defaults.deployCommand,
            ),
        };

        return resolvedSettings;
    }
}
