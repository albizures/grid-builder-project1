export type XmlDesc = XmlAtom | XmlAtom[] | XmlDescArray | XmlObject;
export type XmlObject = { [tag: string]: XmlDesc };
export type XmlAtom = string | number | boolean | null;
export type XmlDescArray = XmlObject[];

export function xml(input: XmlDesc, indent: string = ""): string {
  if (Array.isArray(input)) {
    return input.map((item) => xml(item, " " + indent)).join("\n");
  }

  if (typeof input === "object") {
    const output: string[] = [];
    for (const key in input) {
      if (Object.hasOwn(input, key)) {
        const element = input[key];

        if (element === null) {
          output.push(`${indent}<${key}/>`);
        } else if (typeof element === "object") {
          output.push(
            [
              `${indent}<${key}>`,
              xml(element, " " + indent),
              `${indent}</${key}>`,
            ].join("\n")
          );
        } else {
          output.push([`${indent}<${key}>`, element, `</${key}>`].join(""));
        }
      }
    }

    return output.join("\n");
  }

  return `${indent}${input}`;
}
