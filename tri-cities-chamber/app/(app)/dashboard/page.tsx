import {CardInfo} from "@/components/dashboard/cardInfo"

export default function page () {
  return (
    <div>
        <CardInfo headingText={"Date of Task"} numberInfo={9}/>
        <CardInfo headingText={"Event & Projects"} numberInfo={4}/>
        <CardInfo headingText={"Event & Sponsors"} numberInfo={4}/>
    </div>
  )
}
