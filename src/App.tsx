import React from "react";
import clsx from "clsx";
import { useCopyToClipboard, useTimeoutFn } from "react-use";
import { js2xml } from "xml-js";

function range(size: number) {
  return new Array(size).fill(null);
}

type Grid = (string | null)[][];

function createGrid(width: number, height: number): Grid {
  return range(height).map(() => {
    return range(width);
  });
}

function App() {
  const [sampleId, setSmapleId] = React.useState("1");
  const [description, setSdescription] = React.useState("1");
  const [width, setWidth] = React.useState(10);
  const [height, setHeight] = React.useState(10);
  const [names, setNames] = React.useState<Record<string, string>>({});
  const [values, setValues] = React.useState<string[]>([]);
  const [copyState, copyToClipboard] = useCopyToClipboard();

  const [grid, setGrid] = React.useState(() => {
    return createGrid(10, 10);
  });

  useTimeoutFn(
    () => {
      copyToClipboard("");
    },
    copyState.value ? 1000 : undefined
  );

  function updateValues(grid: Grid) {
    const valuesSet = new Set<string>();
    for (const row of grid) {
      for (const cell of row) {
        cell && valuesSet.add(cell);
      }
    }
    const values = [...valuesSet];

    setNames((current) => {
      const update = {
        ...current,
      };
      for (const value of values) {
        if (!update[value]) {
          update[value] = `Organismo ${value}`;
        }
      }

      return update;
    });
    setValues(values);
  }

  function setCell(x: number, y: number, value: string) {
    setGrid((current) => {
      const row = [...current[y]];
      row[x] = value;
      const update = [...current];
      update[y] = row;

      updateValues(update);
      return update;
    });
  }

  function updateName(value: string, name: string) {
    setNames((current) => {
      return {
        ...current,
        [value]: name,
      };
    });
  }

  function updateWidth(value: number) {
    if (width > value) {
      setGrid((grid) => {
        const update = grid.map((row) => {
          return row.slice(0, value);
        });
        updateValues(update);

        return update;
      });
    }
    if (width < value) {
      setGrid((grid) => {
        const update = grid.map((row) => {
          return [...row, ...range(value - width)];
        });
        updateValues(update);
        return update;
      });
    }

    setWidth(value);
  }
  function updateHeight(value: number) {
    if (height > value) {
      setGrid((grid) => {
        const update = grid.slice(0, value);
        updateValues(update);

        return update;
      });
    }
    if (height < value) {
      setGrid((grid) => {
        const update = [...grid, ...createGrid(width, value - height)];
        updateValues(update);
        return update;
      });
    }

    setHeight(value);
  }

  const xml = [
    '<?xml version="1.0"?>',
    js2xml(
      {
        elements: [
          {
            type: "element",
            name: "datosMarte",
            elements: [
              {
                type: "element",
                name: "listaOrganismos",
                elements: values.map((value) => {
                  return {
                    type: "element",
                    name: "organismo",
                    elements: [
                      {
                        type: "element",
                        name: "codigo",
                        elements: [
                          {
                            type: "text",
                            text: value,
                          },
                        ],
                      },
                      {
                        type: "element",
                        name: "nombre",
                        elements: [
                          {
                            type: "text",
                            text: names[value],
                          },
                        ],
                      },
                    ],
                  };
                }),
              },
              {
                type: "element",
                name: "listadoMuestras",
                elements: [
                  {
                    type: "element",
                    name: "muestra",
                    elements: [
                      {
                        type: "element",
                        name: "codigo",
                        elements: [
                          {
                            type: "text",
                            text: sampleId,
                          },
                        ],
                      },
                      {
                        type: "element",
                        name: "descripcion",
                        elements: [
                          {
                            type: "text",
                            text: description,
                          },
                        ],
                      },
                      {
                        type: "element",
                        name: "filas",
                        elements: [
                          {
                            type: "text",
                            text: height,
                          },
                        ],
                      },
                      {
                        type: "element",
                        name: "columnas",
                        elements: [
                          {
                            type: "text",
                            text: width,
                          },
                        ],
                      },
                      {
                        type: "element",
                        name: "listadoCeldasVivas",
                        elements: grid.reduce((current, row, y) => {
                          return [
                            ...current,
                            ...row
                              .map((value, x) => ({ value, x, y }))
                              .filter((cell) => cell.value !== null)
                              .map((cell) => {
                                return {
                                  type: "element",
                                  name: "celdaViva",
                                  elements: [
                                    {
                                      type: "element",
                                      name: "fila",
                                      elements: [
                                        {
                                          type: "text",
                                          text: cell.y,
                                        },
                                      ],
                                    },
                                    {
                                      type: "element",
                                      name: "columna",
                                      elements: [
                                        {
                                          type: "text",
                                          text: cell.x,
                                        },
                                      ],
                                    },
                                    {
                                      type: "element",
                                      name: "codigoOrganismo",
                                      elements: [
                                        {
                                          type: "text",
                                          text: cell.value,
                                        },
                                      ],
                                    },
                                  ],
                                };
                              }),
                          ];
                        }, [] as unknown[]),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        spaces: 2,
      }
    ),
  ].join("\n");

  return (
    <div className="max-w-screen-lg mx-auto">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label>
            Codigo de la muestra:
            <input
              value={sampleId}
              onChange={(event) => setSmapleId(event.target.value)}
              className="border rounded py-0.5 px-2"
              type="text"
              name="sampleId"
            />
          </label>
        </div>
        <div>
          <label>
            Description de la muestra:
            <input
              value={description}
              onChange={(event) => setSdescription(event.target.value)}
              className="border rounded py-0.5 px-2"
              type="text"
              name="sampleId"
            />
          </label>
        </div>
        <div>
          <label>
            Columnas:
            <input
              value={width}
              onChange={(event) => updateWidth(event.target.valueAsNumber)}
              className="border rounded py-0.5 px-2"
              type="number"
              name="width"
            />
          </label>
        </div>
        <div className="mt-2">
          <label>
            Filas:
            <input
              value={height}
              onChange={(event) => updateHeight(event.target.valueAsNumber)}
              className="border rounded py-0.5 px-2"
              type="number"
              name="height"
            />
          </label>
        </div>
      </div>
      <div>
        <div>
          <h2 className="text-xl font-bold mt-4 mb-2">Vertical Headings:</h2>
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="border border-red-500">y\x</th>
                {grid[0].map((_, index) => {
                  return (
                    <th className="border border-red-500" key={index}>
                      {index + 1}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {grid.map((row, y) => {
                return (
                  <tr className="border border-red-500" key={y}>
                    <th>{y + 1}</th>
                    {row.map((cell, x) => {
                      return (
                        <td
                          className="border border-red-500 py-2"
                          key={`${x}-${y}`}
                        >
                          <input
                            className="w-8 h-5 text-center"
                            type="text"
                            value={cell || ""}
                            onChange={(event) =>
                              setCell(x, y, event.target.value)
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mx-4">
          <h2 className="text-xl font-bold mt-4 mb-2">Organismos</h2>
          {values.map((value, index) => {
            return (
              <div key={index}>
                <label>
                  {value}:{" "}
                  <input
                    className="border rounded py-0.5 px-2"
                    onChange={(event) => updateName(value, event.target.value)}
                    value={names[value]}
                    type="text"
                    name={value}
                  />
                </label>
              </div>
            );
          })}
        </div>
        <div className="bg-gray-2 p-4 rounded-xl relative">
          <div
            className={clsx(
              "absolute right-8 top-0 py-2 px-4 rounded-b-xl text-white",
              {
                " bg-gray-5": !copyState.value,
                "bg-green-5": copyState.value,
              }
            )}
          >
            {copyState.value ? "copied!" : "click to copy"}
          </div>
          <pre onClick={() => copyToClipboard(xml)}>
            <code>{xml}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;
