'use client';

import React from "react";

type Component = React.FC<{ children: React.ReactNode }>;
type AtLeastTwo = [Component, Component, ...Component[]];

// コンポーネント用部分適用関数
export const partial = <P extends object>(
  Component: React.ComponentType<P>, 
  props: P): React.FC<{ children?: React.ReactNode }> => {
    return ({ children }) => {
      return React.createElement(Component, props, children);
    }
}

// コンポーネント用合成関数
export const pipeComponents = (...components: AtLeastTwo): Component => {
  return components.reduce((Acc, Cur) => {
    return ({ children }) => (
      <Acc>
        <Cur>{ children }</Cur>
      </Acc>
    )
  })
}