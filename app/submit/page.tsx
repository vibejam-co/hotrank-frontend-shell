import {SubmitFlow} from "@/components/submit-flow";
import {isHotRankSubmissionIntakeOpen} from "@/lib/hotrank/runtime";

export const dynamic = "force-dynamic";

export default function Submit(){return <main className="shell submit-page"><h1 className="page-title serif">Submit your clip</h1><p style={{fontSize:17,color:'var(--secondary)'}}>Share your best moment. Get discovered on the rankings.</p><SubmitFlow submissionsOpen={isHotRankSubmissionIntakeOpen()}/></main>}
