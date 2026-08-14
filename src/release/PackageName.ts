import { InvalidPackageNameError } from './exceptions/InvalidPackageNameError';


export class PackageName {
    private static readonly _invalidPackageNameCharacterPattern: RegExp = /[\s\u0000-\u001F\u007F]/u;
    private static readonly _regularExpressionCharacterPattern: RegExp = /[.*+?^${}()|[\]\\]/gu;

    public static parse(packageName: string): PackageName {
        const hasInvalidBoundary: boolean = packageName.startsWith('/') || packageName.endsWith('/');

        if (
            packageName.length === 0 ||
            hasInvalidBoundary ||
            PackageName._invalidPackageNameCharacterPattern.test(packageName)
        ) {
            throw new InvalidPackageNameError(packageName);
        }

        return new PackageName(packageName);
    }

    private readonly _value: string;

    private constructor(packageName: string) {
        this._value = packageName;
    }

    public get value(): string {
        return this._value;
    }

    public get regularExpressionValue(): string {
        return this._value.replace(PackageName._regularExpressionCharacterPattern, '\\$&');
    }

    public equals(otherPackageName: PackageName): boolean {
        return this._value === otherPackageName.value;
    }
}
