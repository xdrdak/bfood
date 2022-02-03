import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import recipesJSON from "./recipes.json";

type Recipes = {
  ingredients: string[];
  title: string;
  url: string;
}[];

type RecipeTuple = [string, string[]];

type DerivedIngredients = Record<string, { name: string; count: number }>;

function EditIngredients(props: { ingredients: DerivedIngredients }) {
  const [state, setState] = useState(props.ingredients);
  const [hasCopied, setHasCopied] = useState(false);

  const ingredientList = Object.values(state)
    .filter(({ count }) => count)
    .map(({ name, count }) => {
      return `${count}x ${name}`;
    })
    .join("\n");

  return (
    <div className="flex">
      <div>
        {Object.entries(state).map(([key, value]) => {
          const add = (n: number) => {
            setState((prevState) => {
              return {
                ...prevState,
                [key]: {
                  name: prevState[key].name,
                  count: prevState[key].count + n,
                },
              };
            });
          };

          return (
            <div key={key} className="mb3">
              <button
                className="mr2"
                onClick={() => {
                  add(1);
                }}
              >
                ↑
              </button>
              <button
                className="mr2"
                onClick={() => {
                  if (value.count > 0) {
                    add(-1);
                  }
                }}
              >
                ↓
              </button>
              <span className="mr2">
                {value.count} x {value.name}
              </span>
              <button
                className="red"
                onClick={() => {
                  if (value.count > 0) {
                    add(-value.count);
                  }
                }}
              >
                ✖
              </button>
            </div>
          );
        })}
      </div>
      <div>
        <CopyToClipboard
          text={ingredientList}
          onCopy={() => {
            setHasCopied(true);
            setTimeout(() => {
              setHasCopied(false);
            }, 2000);
          }}
        >
          <button>{hasCopied ? "Copied!" : "Copy List"}</button>
        </CopyToClipboard>
      </div>
    </div>
  );
}

function App() {
  const [state, setState] = useState<RecipeTuple[]>([]);
  const [isEditMode, setEditMode] = useState(false);
  const recipes = recipesJSON as Recipes;

  const derivedIngredients: DerivedIngredients = {};

  for (const [, ingredients] of state) {
    for (const ingredient of ingredients) {
      const key = ingredient.toLowerCase().replaceAll(" ", "_");
      if (!derivedIngredients[key]) {
        derivedIngredients[key] = {
          name: ingredient,
          count: 1,
        };
      } else {
        derivedIngredients[key] = {
          name: ingredient,
          count: derivedIngredients[key].count + 1,
        };
      }
    }
  }

  return (
    <div>
      <div className="flex">
        <div className="w-50 pa3">
          <div className="f3 h3">Recipes</div>
          {recipes.map(({ ingredients, title, url }) => {
            return (
              <div key={url} className="mb2 ba b--black pa2">
                <div className="mb2">
                  <label>
                    <input
                      className="mr2"
                      type="checkbox"
                      onChange={(ev) => {
                        const isChecked = ev.currentTarget.checked;
                        const stateKey = url;

                        setEditMode(false);

                        if (isChecked) {
                          setState((prevState) => [
                            ...prevState,
                            [stateKey, ingredients],
                          ]);
                        } else {
                          setState((prevState) => {
                            return prevState.filter(([key]) => {
                              return key !== stateKey;
                            });
                          });
                        }
                      }}
                    />
                    <span className="b">{title}</span>
                  </label>
                </div>
                <div className="ml4">
                  {ingredients.length ? (
                    <ul className="list ma0 pa0">
                      {ingredients.map((ingredient) => {
                        return <li key={ingredient}>{ingredient}</li>;
                      })}
                    </ul>
                  ) : (
                    <div>(No ingredients)</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="w-50 pa3">
          <div className="h3">
            <button
              onClick={() => {
                setEditMode((s) => !s);
              }}
            >
              {isEditMode ? "Read Mode" : "Edit Mode"}
            </button>
          </div>
          {isEditMode ? (
            <EditIngredients ingredients={derivedIngredients} />
          ) : (
            <>
              {Object.entries(derivedIngredients).map(([key, value]) => {
                return (
                  <div key={key}>
                    {value.count} x {value.name}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
