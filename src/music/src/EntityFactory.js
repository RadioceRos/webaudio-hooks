import React, { useReducer, useEffect } from "react";

const initialFactoryState = {};

const getId = (i => () => ++i)(0);

const factoryReducer = (entities, action) => {
  switch (action.type) {
    case "add": {
      return { ...entities, [action.id]: action.entity };
    }
    case "remove": {
      const obj = { ...entities };
      delete obj[action.id];
      return obj;
    }
    default:
      return entities;
  }
};

// using memo, entity rendering is intentionally cached during the full entity lifecycle.

function Entity({ id, entity, render, dispatch }) {
  return render(entity, () => dispatch({ type: "remove", id }));
}

const EntityRender = React.memo(Entity);

export const EntityFactory = React.forwardRef(function EntityFactory(
  { children, initialEntities },
  ref
) {
  const [entities, dispatch] = useReducer(factoryReducer, initialFactoryState);
  useEffect(() => {
    ref.current = {
      create: entity => {
        const id = getId();
        dispatch({ type: "add", id, entity });
        return () => dispatch({ type: "remove", id });
      }
    };
  }, []);
  return Object.keys(entities).map(id => (
    <EntityRender
      key={id}
      id={id}
      entity={entities[id]}
      render={children}
      dispatch={dispatch}
    />
  ));
});
