import { Composition } from "remotion";
import { aiTokensBrand, aiTokensStoryPlan } from "../lib/ai-tokens.fixture";
import { explainFlowBrand, explainFlowStoryPlan } from "../lib/explainflow.fixture";
import { AiTokensTemplate } from "./AiTokensTemplate";
import { fixtureBrand, fixtureStoryPlan } from "../lib/story-plan.fixture";
import { ExplainerTemplate, type ExplainerTemplateProps } from "./ExplainerTemplate";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition<ExplainerTemplateProps>
        id="ExplainerTemplate"
        component={ExplainerTemplate}
        durationInFrames={fixtureStoryPlan.targetDurationSeconds * 30}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ storyPlan: fixtureStoryPlan, brand: fixtureBrand }}
      />
      <Composition<ExplainerTemplateProps>
        id="AiTokensExplainer"
        component={AiTokensTemplate}
        durationInFrames={aiTokensStoryPlan.targetDurationSeconds * 30}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ storyPlan: aiTokensStoryPlan, brand: aiTokensBrand, visualTheme: "tokens" }}
      />
      <Composition<ExplainerTemplateProps>
        id="ExplainFlowExplainer"
        component={ExplainerTemplate}
        durationInFrames={explainFlowStoryPlan.targetDurationSeconds * 30}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ storyPlan: explainFlowStoryPlan, brand: explainFlowBrand, visualTheme: "explainflow" }}
      />
    </>
  );
};
