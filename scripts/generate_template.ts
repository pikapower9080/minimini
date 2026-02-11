const template = {
  body: [
    {
      board:
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 506 506" style="font-family:helvetica,arial,sans-serif;"><defs><g id="checked"><path d="M103 3 3 103z" class="slash" /></g><g id="modified"><path d="M103 3H69.67L103 36.33z" class="flag" /></g><g id="revealed"><path d="M103 3H69.67L103 36.33z" class="flag" /><circle cx="93.24" cy="12.76" r="4.88" class="tatter" /></g></defs><g class="cells"><g data-index="0"><path d="M3 3h1e2v1e2H3z" fill="none" class="cell"/><text x="5" y="36.83" text-anchor="start" font-size="33.33" class="label" >1</text><text x="53" y="94.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="1"><path d="M103 3h1e2v1e2H103z" fill="none" class="cell"/><text x="105" y="36.83" text-anchor="start" font-size="33.33" class="label" >2</text><text x="153" y="94.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="2"><path d="M203 3h1e2v1e2H203z" fill="none" class="cell"/><text x="205" y="36.83" text-anchor="start" font-size="33.33" class="label" >3</text><text x="253" y="94.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="3"><path d="M303 3h1e2v1e2H303z" fill="none" class="cell"/><text x="305" y="36.83" text-anchor="start" font-size="33.33" class="label" >4</text><text x="353" y="94.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="4"><path d="M403 3h1e2v1e2H403z" fill="none" class="cell"/><text x="405" y="36.83" text-anchor="start" font-size="33.33" class="label" >5</text><text x="453" y="94.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="5"><path d="M3 103h1e2v1e2H3z" fill="none" class="cell"/><text x="5" y="136.83" text-anchor="start" font-size="33.33" class="label" >6</text><text x="53" y="194.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="6"><path d="M103 103h1e2v1e2H103z" fill="none" class="cell"/><circle cx="153" cy="153" r="49.75" stroke="dimgray" fill="none" vector-effect="non-scaling-stroke" class="circle" /><text x="153" y="194.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="7"><path d="M203 103h1e2v1e2H203z" fill="none" class="cell"/><circle cx="253" cy="153" r="49.75" stroke="dimgray" fill="none" vector-effect="non-scaling-stroke" class="circle" /><text x="253" y="194.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="8"><path d="M303 103h1e2v1e2H303z" fill="none" class="cell"/><circle cx="353" cy="153" r="49.75" stroke="dimgray" fill="none" vector-effect="non-scaling-stroke" class="circle" /><text x="353" y="194.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="9"><path d="M403 103h1e2v1e2H403z" fill="none" class="cell"/><circle cx="453" cy="153" r="49.75" stroke="dimgray" fill="none" vector-effect="non-scaling-stroke" class="circle" /><text x="453" y="194.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="10"><path d="M3 203h1e2v1e2H3z" fill="none" class="cell"/><text x="5" y="236.83" text-anchor="start" font-size="33.33" class="label" >7</text><text x="53" y="294.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="11"><path d="M103 203h1e2v1e2H103z" fill="none" class="cell"/><text x="153" y="294.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="12"><path d="M203 203h1e2v1e2H203z" fill="none" class="cell"/><text x="253" y="294.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="13"><path d="M303 203h1e2v1e2H303z" fill="none" class="cell"/><text x="353" y="294.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="14"><path d="M403 203h1e2v1e2H403z" fill="none" class="cell"/><text x="453" y="294.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="15"><path d="M3 303h1e2v1e2H3z" fill="#000" class="cell"/></g><g data-index="16"><path d="M103 303h1e2v1e2H103z" fill="none" class="cell"/><text x="105" y="336.83" text-anchor="start" font-size="33.33" class="label" >8</text><text x="153" y="394.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="17"><path d="M203 303h1e2v1e2H203z" fill="none" class="cell"/><circle cx="253" cy="353" r="49.75" stroke="dimgray" fill="none" vector-effect="non-scaling-stroke" class="circle" /><text x="253" y="394.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="18"><path d="M303 303h1e2v1e2H303z" fill="none" class="cell"/><circle cx="353" cy="353" r="49.75" stroke="dimgray" fill="none" vector-effect="non-scaling-stroke" class="circle" /><text x="353" y="394.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="19"><path d="M403 303h1e2v1e2H403z" fill="none" class="cell"/><circle cx="453" cy="353" r="49.75" stroke="dimgray" fill="none" vector-effect="non-scaling-stroke" class="circle" /><text x="453" y="394.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="20"><path d="M3 403h1e2v1e2H3z" fill="#000" class="cell"/></g><g data-index="21"><path d="M103 403h1e2v1e2H103z" fill="#000" class="cell"/></g><g data-index="22"><path d="M203 403h1e2v1e2H203z" fill="none" class="cell"/><text x="205" y="436.83" text-anchor="start" font-size="33.33" class="label" >9</text><text x="253" y="494.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="23"><path d="M303 403h1e2v1e2H303z" fill="none" class="cell"/><text x="353" y="494.67" text-anchor="middle" font-size="66.67" class="guess"/></g><g data-index="24"><path d="M403 403h1e2v1e2H403z" fill="none" class="cell"/><text x="453" y="494.67" text-anchor="middle" font-size="66.67" class="guess"/></g></g><g class="grid"><path d="M3 103h5e2M3 203h5e2M3 303h5e2M3 403h5e2M103 3v5e2M203 3v5e2M303 3v5e2M403 3v5e2" stroke="dimgray" fill="none" vector-effect="non-scaling-stroke" class="lines" /><path d="M1.5 1.5h503v503H1.5z" fill="none" stroke="#000" stroke-width="3" class="frame" /></g></svg>',
      cells: [
        {
          answer: "B",
          clues: [0, 5],
          label: "1",
          type: 1
        },
        {
          answer: "A",
          clues: [0, 6],
          label: "2",
          type: 1
        },
        {
          answer: "S",
          clues: [0, 7],
          label: "3",
          type: 1
        },
        {
          answer: "I",
          clues: [0, 8],
          label: "4",
          type: 1
        },
        {
          answer: "C",
          clues: [0, 9],
          label: "5",
          type: 1
        },
        {
          answer: "T",
          clues: [1, 5],
          label: "6",
          type: 1
        },
        {
          answer: "H",
          clues: [1, 6],
          type: 2
        },
        {
          answer: "I",
          clues: [1, 7],
          type: 2
        },
        {
          answer: "G",
          clues: [1, 8],
          type: 2
        },
        {
          answer: "H",
          clues: [1, 9],
          type: 2
        },
        {
          answer: "W",
          clues: [2, 5],
          label: "7",
          type: 1
        },
        {
          answer: "A",
          clues: [2, 6],
          type: 1
        },
        {
          answer: "L",
          clues: [2, 7],
          type: 1
        },
        {
          answer: "L",
          clues: [2, 8],
          type: 1
        },
        {
          answer: "E",
          clues: [2, 9],
          type: 1
        },
        {},
        {
          answer: "S",
          clues: [3, 6],
          label: "8",
          type: 1
        },
        {
          answer: "L",
          clues: [3, 7],
          type: 2
        },
        {
          answer: "O",
          clues: [3, 8],
          type: 2
        },
        {
          answer: "W",
          clues: [3, 9],
          type: 2
        },
        {},
        {},
        {
          answer: "S",
          clues: [4, 7],
          label: "9",
          type: 1
        },
        {
          answer: "O",
          clues: [4, 8],
          type: 1
        },
        {
          answer: "Y",
          clues: [4, 9],
          type: 1
        }
      ],
      clueLists: [
        {
          clues: [0, 1, 2, 3, 4],
          name: "Across"
        },
        {
          clues: [5, 6, 7, 8, 9],
          name: "Down"
        }
      ],
      clues: [
        {
          cells: [0, 1, 2, 3, 4],
          direction: "Across",
          label: "1",
          text: [
            {
              plain: "Opposite of acidic"
            }
          ]
        },
        {
          cells: [5, 6, 7, 8, 9],
          direction: "Across",
          label: "6",
          text: [
            {
              plain: "Where the hamstring is"
            }
          ]
        },
        {
          cells: [10, 11, 12, 13, 14],
          direction: "Across",
          label: "7",
          text: [
            {
              plain: "Pixar film whose opening 35 minutes feature nearly no dialogue"
            }
          ]
        },
        {
          cells: [16, 17, 18, 19],
          direction: "Across",
          label: "8",
          text: [
            {
              plain: "Glacial"
            }
          ]
        },
        {
          cells: [22, 23, 24],
          direction: "Across",
          label: "9",
          text: [
            {
              formatted: "&#34;Yo ___&#34; (Spanish for &#34;I am&#34;)",
              plain: '"Yo ___" (Spanish for "I am")'
            }
          ]
        },
        {
          cells: [0, 5, 10],
          direction: "Down",
          label: "1",
          list: 1,
          text: [
            {
              formatted: "&#34;Oh, I meant to tell you ...,&#34; in texts ",
              plain: '"Oh, I meant to tell you ...," in texts '
            }
          ]
        },
        {
          cells: [1, 6, 11, 16],
          direction: "Down",
          label: "2",
          list: 1,
          text: [
            {
              plain: "Light bulb moments"
            }
          ]
        },
        {
          cells: [2, 7, 12, 17, 22],
          direction: "Down",
          label: "3",
          list: 1,
          text: [
            {
              plain: "Window ledges"
            }
          ]
        },
        {
          cells: [3, 8, 13, 18, 23],
          direction: "Down",
          label: "4",
          list: 1,
          text: [
            {
              plain: "Shelter made of snow blocks"
            }
          ]
        },
        {
          cells: [4, 9, 14, 19, 24],
          direction: "Down",
          label: "5",
          list: 1,
          text: [
            {
              plain: "Like bagels and gummy bears"
            }
          ]
        }
      ],
      dimensions: {
        height: 5,
        width: 5
      },
      SVG: {
        name: "svg",
        attributes: [
          {
            name: "xmlns",
            value: "http://www.w3.org/2000/svg"
          },
          {
            name: "viewBox",
            value: "0 0 506.00 506.00"
          }
        ],
        children: [
          {
            name: "defs",
            children: [
              {
                name: "g",
                attributes: [
                  {
                    name: "id",
                    value: "checked"
                  }
                ],
                children: [
                  {
                    name: "line",
                    attributes: [
                      {
                        name: "x1",
                        value: "103.00"
                      },
                      {
                        name: "y1",
                        value: "3.00"
                      },
                      {
                        name: "x2",
                        value: "3.00"
                      },
                      {
                        name: "y2",
                        value: "103.00"
                      },
                      {
                        name: "class",
                        value: "slash"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                attributes: [
                  {
                    name: "id",
                    value: "modified"
                  }
                ],
                children: [
                  {
                    name: "polygon",
                    attributes: [
                      {
                        name: "points",
                        value: "103.00,3.00 69.67,3.00 103.00,36.33"
                      },
                      {
                        name: "class",
                        value: "flag"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                attributes: [
                  {
                    name: "id",
                    value: "revealed"
                  }
                ],
                children: [
                  {
                    name: "polygon",
                    attributes: [
                      {
                        name: "points",
                        value: "103.00,3.00 69.67,3.00 103.00,36.33"
                      },
                      {
                        name: "class",
                        value: "flag"
                      }
                    ]
                  },
                  {
                    name: "circle",
                    attributes: [
                      {
                        name: "cx",
                        value: "93.24"
                      },
                      {
                        name: "cy",
                        value: "12.76"
                      },
                      {
                        name: "r",
                        value: "4.88"
                      },
                      {
                        name: "class",
                        value: "tatter"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: "g",
            attributes: [
              {
                name: "data-group",
                value: "cells"
              }
            ],
            children: [
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "3.00"
                      },
                      {
                        name: "y",
                        value: "3.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "5.00"
                      },
                      {
                        name: "y",
                        value: "36.83"
                      },
                      {
                        name: "text-anchor",
                        value: "start"
                      },
                      {
                        name: "font-size",
                        value: "33.33"
                      }
                    ],
                    content: "1"
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "53.00"
                      },
                      {
                        name: "y",
                        value: "94.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "103.00"
                      },
                      {
                        name: "y",
                        value: "3.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "105.00"
                      },
                      {
                        name: "y",
                        value: "36.83"
                      },
                      {
                        name: "text-anchor",
                        value: "start"
                      },
                      {
                        name: "font-size",
                        value: "33.33"
                      }
                    ],
                    content: "2"
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "153.00"
                      },
                      {
                        name: "y",
                        value: "94.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "203.00"
                      },
                      {
                        name: "y",
                        value: "3.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "205.00"
                      },
                      {
                        name: "y",
                        value: "36.83"
                      },
                      {
                        name: "text-anchor",
                        value: "start"
                      },
                      {
                        name: "font-size",
                        value: "33.33"
                      }
                    ],
                    content: "3"
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "253.00"
                      },
                      {
                        name: "y",
                        value: "94.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "303.00"
                      },
                      {
                        name: "y",
                        value: "3.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "305.00"
                      },
                      {
                        name: "y",
                        value: "36.83"
                      },
                      {
                        name: "text-anchor",
                        value: "start"
                      },
                      {
                        name: "font-size",
                        value: "33.33"
                      }
                    ],
                    content: "4"
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "353.00"
                      },
                      {
                        name: "y",
                        value: "94.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "403.00"
                      },
                      {
                        name: "y",
                        value: "3.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "405.00"
                      },
                      {
                        name: "y",
                        value: "36.83"
                      },
                      {
                        name: "text-anchor",
                        value: "start"
                      },
                      {
                        name: "font-size",
                        value: "33.33"
                      }
                    ],
                    content: "5"
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "453.00"
                      },
                      {
                        name: "y",
                        value: "94.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "3.00"
                      },
                      {
                        name: "y",
                        value: "103.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "5.00"
                      },
                      {
                        name: "y",
                        value: "136.83"
                      },
                      {
                        name: "text-anchor",
                        value: "start"
                      },
                      {
                        name: "font-size",
                        value: "33.33"
                      }
                    ],
                    content: "6"
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "53.00"
                      },
                      {
                        name: "y",
                        value: "194.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "103.00"
                      },
                      {
                        name: "y",
                        value: "103.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "circle",
                    attributes: [
                      {
                        name: "cx",
                        value: "153.00"
                      },
                      {
                        name: "cy",
                        value: "153.00"
                      },
                      {
                        name: "r",
                        value: "49.75"
                      },
                      {
                        name: "stroke",
                        value: "dimgray"
                      },
                      {
                        name: "fill",
                        value: "none"
                      },
                      {
                        name: "vector-effect",
                        value: "non-scaling-stroke"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "153.00"
                      },
                      {
                        name: "y",
                        value: "194.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "203.00"
                      },
                      {
                        name: "y",
                        value: "103.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "circle",
                    attributes: [
                      {
                        name: "cx",
                        value: "253.00"
                      },
                      {
                        name: "cy",
                        value: "153.00"
                      },
                      {
                        name: "r",
                        value: "49.75"
                      },
                      {
                        name: "stroke",
                        value: "dimgray"
                      },
                      {
                        name: "fill",
                        value: "none"
                      },
                      {
                        name: "vector-effect",
                        value: "non-scaling-stroke"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "253.00"
                      },
                      {
                        name: "y",
                        value: "194.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "303.00"
                      },
                      {
                        name: "y",
                        value: "103.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "circle",
                    attributes: [
                      {
                        name: "cx",
                        value: "353.00"
                      },
                      {
                        name: "cy",
                        value: "153.00"
                      },
                      {
                        name: "r",
                        value: "49.75"
                      },
                      {
                        name: "stroke",
                        value: "dimgray"
                      },
                      {
                        name: "fill",
                        value: "none"
                      },
                      {
                        name: "vector-effect",
                        value: "non-scaling-stroke"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "353.00"
                      },
                      {
                        name: "y",
                        value: "194.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "403.00"
                      },
                      {
                        name: "y",
                        value: "103.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "circle",
                    attributes: [
                      {
                        name: "cx",
                        value: "453.00"
                      },
                      {
                        name: "cy",
                        value: "153.00"
                      },
                      {
                        name: "r",
                        value: "49.75"
                      },
                      {
                        name: "stroke",
                        value: "dimgray"
                      },
                      {
                        name: "fill",
                        value: "none"
                      },
                      {
                        name: "vector-effect",
                        value: "non-scaling-stroke"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "453.00"
                      },
                      {
                        name: "y",
                        value: "194.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "3.00"
                      },
                      {
                        name: "y",
                        value: "203.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "5.00"
                      },
                      {
                        name: "y",
                        value: "236.83"
                      },
                      {
                        name: "text-anchor",
                        value: "start"
                      },
                      {
                        name: "font-size",
                        value: "33.33"
                      }
                    ],
                    content: "7"
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "53.00"
                      },
                      {
                        name: "y",
                        value: "294.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "103.00"
                      },
                      {
                        name: "y",
                        value: "203.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "153.00"
                      },
                      {
                        name: "y",
                        value: "294.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "203.00"
                      },
                      {
                        name: "y",
                        value: "203.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "253.00"
                      },
                      {
                        name: "y",
                        value: "294.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "303.00"
                      },
                      {
                        name: "y",
                        value: "203.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "353.00"
                      },
                      {
                        name: "y",
                        value: "294.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "403.00"
                      },
                      {
                        name: "y",
                        value: "203.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "453.00"
                      },
                      {
                        name: "y",
                        value: "294.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "3.00"
                      },
                      {
                        name: "y",
                        value: "303.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "black"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "103.00"
                      },
                      {
                        name: "y",
                        value: "303.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "105.00"
                      },
                      {
                        name: "y",
                        value: "336.83"
                      },
                      {
                        name: "text-anchor",
                        value: "start"
                      },
                      {
                        name: "font-size",
                        value: "33.33"
                      }
                    ],
                    content: "8"
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "153.00"
                      },
                      {
                        name: "y",
                        value: "394.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "203.00"
                      },
                      {
                        name: "y",
                        value: "303.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "circle",
                    attributes: [
                      {
                        name: "cx",
                        value: "253.00"
                      },
                      {
                        name: "cy",
                        value: "353.00"
                      },
                      {
                        name: "r",
                        value: "49.75"
                      },
                      {
                        name: "stroke",
                        value: "dimgray"
                      },
                      {
                        name: "fill",
                        value: "none"
                      },
                      {
                        name: "vector-effect",
                        value: "non-scaling-stroke"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "253.00"
                      },
                      {
                        name: "y",
                        value: "394.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "303.00"
                      },
                      {
                        name: "y",
                        value: "303.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "circle",
                    attributes: [
                      {
                        name: "cx",
                        value: "353.00"
                      },
                      {
                        name: "cy",
                        value: "353.00"
                      },
                      {
                        name: "r",
                        value: "49.75"
                      },
                      {
                        name: "stroke",
                        value: "dimgray"
                      },
                      {
                        name: "fill",
                        value: "none"
                      },
                      {
                        name: "vector-effect",
                        value: "non-scaling-stroke"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "353.00"
                      },
                      {
                        name: "y",
                        value: "394.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "403.00"
                      },
                      {
                        name: "y",
                        value: "303.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "circle",
                    attributes: [
                      {
                        name: "cx",
                        value: "453.00"
                      },
                      {
                        name: "cy",
                        value: "353.00"
                      },
                      {
                        name: "r",
                        value: "49.75"
                      },
                      {
                        name: "stroke",
                        value: "dimgray"
                      },
                      {
                        name: "fill",
                        value: "none"
                      },
                      {
                        name: "vector-effect",
                        value: "non-scaling-stroke"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "453.00"
                      },
                      {
                        name: "y",
                        value: "394.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "3.00"
                      },
                      {
                        name: "y",
                        value: "403.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "black"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "103.00"
                      },
                      {
                        name: "y",
                        value: "403.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "black"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "203.00"
                      },
                      {
                        name: "y",
                        value: "403.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "205.00"
                      },
                      {
                        name: "y",
                        value: "436.83"
                      },
                      {
                        name: "text-anchor",
                        value: "start"
                      },
                      {
                        name: "font-size",
                        value: "33.33"
                      }
                    ],
                    content: "9"
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "253.00"
                      },
                      {
                        name: "y",
                        value: "494.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "303.00"
                      },
                      {
                        name: "y",
                        value: "403.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "353.00"
                      },
                      {
                        name: "y",
                        value: "494.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              },
              {
                name: "g",
                children: [
                  {
                    name: "rect",
                    attributes: [
                      {
                        name: "x",
                        value: "403.00"
                      },
                      {
                        name: "y",
                        value: "403.00"
                      },
                      {
                        name: "width",
                        value: "100.00"
                      },
                      {
                        name: "height",
                        value: "100.00"
                      },
                      {
                        name: "fill",
                        value: "none"
                      }
                    ]
                  },
                  {
                    name: "text",
                    attributes: [
                      {
                        name: "x",
                        value: "453.00"
                      },
                      {
                        name: "y",
                        value: "494.67"
                      },
                      {
                        name: "text-anchor",
                        value: "middle"
                      },
                      {
                        name: "font-size",
                        value: "66.67"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: "g",
            attributes: [
              {
                name: "data-group",
                value: "grid"
              }
            ],
            children: [
              {
                name: "path",
                attributes: [
                  {
                    name: "d",
                    value:
                      "M3.00,103.00 l500.00,0.00 M3.00,203.00 l500.00,0.00 M3.00,303.00 l500.00,0.00 M3.00,403.00 l500.00,0.00 M103.00,3.00 l0.00,500.00 M203.00,3.00 l0.00,500.00 M303.00,3.00 l0.00,500.00 M403.00,3.00 l0.00,500.00"
                  },
                  {
                    name: "stroke",
                    value: "dimgray"
                  },
                  {
                    name: "fill",
                    value: "none"
                  },
                  {
                    name: "vector-effect",
                    value: "non-scaling-stroke"
                  }
                ]
              },
              {
                name: "rect",
                attributes: [
                  {
                    name: "x",
                    value: "1.50"
                  },
                  {
                    name: "y",
                    value: "1.50"
                  },
                  {
                    name: "width",
                    value: "503.00"
                  },
                  {
                    name: "height",
                    value: "503.00"
                  },
                  {
                    name: "fill",
                    value: "none"
                  },
                  {
                    name: "stroke",
                    value: "black"
                  },
                  {
                    name: "stroke-width",
                    value: "3.00"
                  }
                ]
              }
            ]
          }
        ],
        styles: [
          {
            name: "font-family",
            value: "helvetica,arial,sans-serif"
          }
        ]
      }
    }
  ],
  constructors: ["Joel Fagliano"],
  copyright: "2024",
  editor: "Sam Ezersky",
  id: 22260,
  lastUpdated: "2024-09-11 19:46:42 +0000 UTC",
  publicationDate: "2024-09-22",
  subcategory: 2
};
const body = template.body[0];
body.SVG = {} as any;

body.clues.forEach((clue) => {
  clue.text[0].plain = "Click to edit";
  // @ts-ignore
  if (clue.text[0].formatted) {
    // @ts-ignore
    clue.text[0].formatted = "Click to edit";
  }
});

body.cells.forEach((cell) => {
  if (cell.answer) {
    cell.answer = "";
  }
});

template.constructors = [];
template.copyright = "";
template.editor = "";

console.log(JSON.stringify(template));
