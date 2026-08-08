import { InvalidNpmPackageOverridesError } from './exceptions/InvalidNpmPackageOverridesError';
import type { NpmPackageOverride } from './NpmPackageOverride';


export class NpmPackageOverridesParser {
    private static readonly _deployCommandProperty: string = 'npm-deploy-command';
    private static readonly _nodeVersionProperty: string = 'npm-node-version';
    private static readonly _packageDirectoryProperty: string = 'npm-package-dir';

    private static _isRecord(value: unknown): value is Record<string, unknown> {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }

    private static _readOptionalString(
        settings: Readonly<Record<string, unknown>>,
        propertyName: string,
        packageName: string,
    ): string | undefined {
        const propertyValue: unknown = settings[propertyName];

        if (propertyValue === undefined || propertyValue === null) {
            return undefined;
        }

        if (typeof propertyValue !== 'string') {
            throw new InvalidNpmPackageOverridesError(
                `property '${propertyName}' for package '${packageName}' must be a string`,
            );
        }

        return propertyValue;
    }

    private static _parsePackageOverride(packageName: string, value: unknown): NpmPackageOverride {
        if (!NpmPackageOverridesParser._isRecord(value)) {
            throw new InvalidNpmPackageOverridesError(`package '${packageName}' must map to an object`);
        }

        const nodeVersion: string | undefined = NpmPackageOverridesParser._readOptionalString(
            value,
            NpmPackageOverridesParser._nodeVersionProperty,
            packageName,
        );

        const packageDirectory: string | undefined = NpmPackageOverridesParser._readOptionalString(
            value,
            NpmPackageOverridesParser._packageDirectoryProperty,
            packageName,
        );

        const deployCommand: string | undefined = NpmPackageOverridesParser._readOptionalString(
            value,
            NpmPackageOverridesParser._deployCommandProperty,
            packageName,
        );

        return {
            ...(nodeVersion === undefined ? {} : { nodeVersion }),
            ...(packageDirectory === undefined ? {} : { packageDirectory }),
            ...(deployCommand === undefined ? {} : { deployCommand }),
        };
    }

    public static parse(serializedOverrides: string): Readonly<Record<string, NpmPackageOverride>> {
        let parsedOverrides: unknown;

        try {
            parsedOverrides = JSON.parse(serializedOverrides) as unknown;
        } catch (error: unknown) {
            const reason: string = error instanceof Error ? error.message : 'the value is not valid JSON';

            throw new InvalidNpmPackageOverridesError(reason);
        }

        if (!NpmPackageOverridesParser._isRecord(parsedOverrides)) {
            throw new InvalidNpmPackageOverridesError('the top-level value must be an object');
        }

        const packageOverrideEntries: [string, unknown][] = Object.entries(parsedOverrides);

        const normalizedOverrideEntries: [string, NpmPackageOverride][] = packageOverrideEntries.map(
            (packageOverrideEntry: [string, unknown]): [string, NpmPackageOverride] => {
                const packageName: string = packageOverrideEntry[0];
                const packageOverrideValue: unknown = packageOverrideEntry[1];

                return [
                    packageName,
                    NpmPackageOverridesParser._parsePackageOverride(packageName, packageOverrideValue),
                ];
            },
        );

        const packageOverrides: Record<string, NpmPackageOverride> = Object.fromEntries(normalizedOverrideEntries);

        return packageOverrides;
    }
}
