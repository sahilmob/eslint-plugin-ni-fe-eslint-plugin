import { Rule } from "eslint";

export const getModuleScope = (context: Rule.RuleContext) => {
  let scope = context.getScope();
  while (scope.type !== "module") {
    scope = scope.upper;
  }

  return scope;
};
