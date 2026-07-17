import { Workbench } from "../components/workbench/workbench";
import { motionExamples } from "../domain/examples";

export default function Home() {
  return <Workbench initialAnalysis={motionExamples[0].fallbackAnalysis} />;
}
