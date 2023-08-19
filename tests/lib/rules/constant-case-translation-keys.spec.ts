/**
 * @fileoverview constant-case-translation-keys tests
 * @author Sahil H. Mubaideen
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
import { RuleTester } from "eslint";

import rule, {
  ERROR_MESSAGE,
} from "../../../lib/rules/constant-case-translation-keys";
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
});
ruleTester.run("constant-case-translation-keys", rule, {
  valid: [
    {
      code: `
        import {useTranslation} from "react-i18next";

        export const Component = () => {

          const {t} = useTranslation();
          return <div>{t("CONSTANT_CASE_KEY")}</div>
        };
      `,
    },
    {
      options: [{ translationHookName: "useTrs" }],
      code: `
        import {useTrs} from "react-i18next";

        export const Component = () => {

          const {t} = useTrs();
          return <div>{t("CONSTANT_CASE_KEY")}</div>
        };
      `,
    },
    {
      code: `
        import {useTranslation} from "react-i18next";

        export const Component = () => {

          const {t} = useTranslation();
          return <div>{t("NAMESPACE.CONSTANT_CASE_KEY")}</div>
        };
      `,
    },
    {
      code: `
        import {useTranslation} from "react-i18next";

        const translationKey = "CONSTANT_CASE_KEY"; 

        export const Component = () => {

          const {t} = useTranslation();          
          return <div>{t(translationKey)}</div>
        };
      `,
    },
    {
      code: `
        import {useTranslation as useT} from "react-i18next";

        export const Component = () => {

          const {t} = useT();
          return <div>{t("NAMESPACE.CONSTANT_CASE_KEY")}</div>
        };
      `,
    },
    {
      code: `
        import {useTranslation} from "react-i18next";

        export const Component = () => {

          const ut = useTranslation();
          return <div>{ut.t("CONSTANT_CASE_KEY")}</div>
        };
      `,
    },
  ],

  invalid: [
    {
      code: `
        import {useTranslation} from "react-i18next";

        export const Component = () => {

          const {t} = useTranslation();
          return <div>{t("camelCaseKey")}</div>
        };
      `,
      errors: [{ message: ERROR_MESSAGE, type: "Literal" }],
    },
    {
      code: `
        import {useTranslation} from "react-i18next";

        export const Component = () => {

          const {t} = useTranslation();
          return <div>{t("namespace.camelCaseKey")}</div>
        };
      `,
      errors: [{ message: ERROR_MESSAGE, type: "Literal" }],
    },
    {
      code: `
        import {useTranslation} from "react-i18next";

        export const Component = () => {

          const ut = useTranslation();
          return <div>{ut.t("camelCaseKey")}</div>
        };
      `,
      errors: [{ message: ERROR_MESSAGE, type: "Literal" }],
    },
    {
      code: `
        import {useTranslation} from "react-i18next";

        export const Component = () => {

          const ut = useTranslation();
          return <div>{ut.t("namespace.camelCaseKey")}</div>
        };
      `,
      errors: [{ message: ERROR_MESSAGE, type: "Literal" }],
    },
    {
      options: [{ translationHookName: "useTrs" }],
      code: `
        import {useTrs} from "react-i18next";

        export const Component = () => {

          const {t} = useTrs();
          return <div>{t("camelCaseKey")}</div>
        };
      `,
      errors: [{ message: ERROR_MESSAGE, type: "Literal" }],
    },
    {
      options: [{ translationHookName: "useTrs" }],
      code: `
        import {useTrs} from "react-i18next";

        export const Component = () => {

          const {t} = useTrs();
          return <div>{t("namespace.camelCaseKey")}</div>
        };
      `,
      errors: [{ message: ERROR_MESSAGE, type: "Literal" }],
    },

    {
      options: [{ translationHookName: "useTrs" }],
      code: `
        import {useTrs} from "react-i18next";

        export const Component = () => {

          const trs = useTrs();
          return <div>{trs.t("namespace.camelCaseKey")}</div>
        };
      `,
      errors: [{ message: ERROR_MESSAGE, type: "Literal" }],
    },
  ],
});
