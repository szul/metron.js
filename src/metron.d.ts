declare module metron {
    class tools {
        static extend(subClass: any, superClass: any): void;
        static clone(obj: any): any;
        static mixin(receivingObject: any, mixinObject: any): void;
    }
    class dictionary {
        length: number;
        items: any;
        constructor(obj?: any);
        setItem(key: string, value: any): void;
        getItem(key: string): any;
        hasItem(key: string): boolean;
        removeItem(key: string): number;
        keys(): Array<string>;
        values(): Array<any>;
        each(f: Function): void;
        clear(): void;
    }
    class web {
        static querystring(obj: any): Array<string>;
        static querystring(url: string, obj: any): Array<string>;
        static querystringify(obj: any): string;
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
    //isNullOrEmpty: (val: string) => boolean;
}
