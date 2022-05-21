import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
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
  const [password, setPassword] = useState("");

  const ingredientList = Object.values(state)
    .filter(({ count }) => count)
    .map(({ name, count }) => {
      return `${count}x ${name}`;
    })
    .join("\n");

  const ingredientsPayload = JSON.stringify(
    Object.values(state).filter(({ count }) => count)
  );

  const entries = Object.entries(state);

  return (
    <div className="flex">
      <div>
        {entries.map(([key, value]) => {
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
      {entries.length === 0 ? (
        "No ingredients selected"
      ) : (
        <div>
          <div className="mb2">
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
          <div>
            <label>Password</label>
            <br />
            <input
              type="text"
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);
              }}
            />
            <button
              onClick={() => {
                fetch(
                  "https://bfoodtrack.netlify.app/.netlify/functions/post",
                  {
                    method: "POST",
                    headers: {
                      "x-password": password,
                      "Content-Type": "application/json",
                    },
                    body: ingredientsPayload,
                  }
                );
              }}
            >
              Save ingredient list
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Home() {
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

  let selectedRecipes = [];
  for (const [url] of state) {
    const recipe = recipes.find((r) => r.url === url);
    if (recipe) {
      selectedRecipes.push(recipe);
    }
  }

  return (
    <div>
      <div className="flex">
        <div className="w-40 pr2">
          <div className="f3 h3">Recipes ({recipes.length})</div>
          {recipes.map(({ ingredients, title, url }, index) => {
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
                    <span className="b">
                      {index + 1} - {title}
                    </span>
                  </label>
                  &nbsp;<a href={url}>link</a>
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
        <div className="w-60">
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
            <div className="flex">
              <div>
                {Object.entries(derivedIngredients).map(([key, value]) => {
                  return (
                    <div key={key}>
                      {value.count} x {value.name}
                    </div>
                  );
                })}
              </div>
              <div>
                {selectedRecipes.map((r) => {
                  return (
                    <div key={r.url}>
                      {r.title} - <a href={r.url}>link</a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Todo() {
  return <div>allo allo</div>;
}

function App() {
  return (
    <BrowserRouter>
      <div className="mw9 center avenir">
        <div className="mb4">
          <nav>
            <Link to="/">Home</Link> | <Link to="/todo">todo</Link>
          </nav>
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/todo" element={<Todo />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
