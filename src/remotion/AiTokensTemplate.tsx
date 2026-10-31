import React from "react";
import { ExplainerTemplate, type ExplainerTemplateProps } from "./ExplainerTemplate";

export const AiTokensTemplate: React.FC<ExplainerTemplateProps> = (props) => (
  <ExplainerTemplate {...props} visualTheme="tokens" />
);
