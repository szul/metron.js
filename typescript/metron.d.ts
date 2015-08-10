declare module metron {
    class tools {
        static extend(subClass: any, superClass: any): void;
        static clone(obj: any): any;
        static mixin(receivingObject: any, mixinObject: any): void;
    }
    class dictionary {
        public length: number;
        public items: any;
        constructor(obj?: any);
        public setItem(key: string, value: any): void;
        public getItem(key: string): any;
        public hasItem(key: string): boolean;
        public removeItem(key: string): number;
        public keys(): string[];
        public values(): any[];
        public each(f: Function): void;
        public clear(): void;
    }
    class web {
        static querystring(obj: string): Array<string>;
    }
}
interface String {
    lower: () => string;
    upper: () => string;
    ltrim: () => string;
    rtrim: () => string;
    normalize: () => string;
    startsWith: (part: string) => boolean;
    endsWith: (part: string) => boolean;
    capFirst: () => string;
    capWords: () => string;
    truncateWords: (number: number) => string;
    truncateWordsWithHtml: (number: number) => string;
    stripHtml: () => string;
    escapeHtml: () => string;
    toBool: () => boolean;
    contains: (val: string) => boolean;
    slugify: () => string;
    toPhoneNumber: () => string;
}
