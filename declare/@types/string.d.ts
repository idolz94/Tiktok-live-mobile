export {};

declare global {
  interface String {
    /**
     * Convert string to camel case
     */
    capitalize(): string;

    /**
     * Convert all UTF-8 to ASCII lowercase.
     */
    changeAlias(): string;

    /**
     * convert string to valid file name
     */
    convertValidFileName(): string;

    /**
     * Bỏ dấu
     */
    removeAccent(): string;

    /**
     * Remove html tag from string
     */
    removeHtmlTag(): string;

    /**
     * Return true if string is empty
     */
    isEmpty(): boolean;

    /**
     * Remove all characters except 0-9
     */
    removeChar(): string;

    /**
     * Get all URL from string
     */
    getURL(): Array<string>;

    /**
     * Replaces all match with string
     */
    replaceAll(searchValue: string, replaceValue: string): string;

    /**
     * Convert string color to hex color
     */
    toHexColor(): string;

    /**
     * Convert japanese full width to half width
     */
    toHalfWidth(): string;

    /**
     * Convert japanese half width to full width
     */
    toFullWidth(): string;

    /**
     * Create random string ID
     */
    randomUniqueId(): string;

    upperCaseFirstLetter(): string;

    removeSpace(): string;

    /**
     * Pads the string with spaces at the end to reach specified length
     * @param length Target length for the string
     * @returns Original string if already longer than target length, otherwise padded string
     */
    padSpaceToEnd(length: number): string;
  }
}
