import { Search } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
export default function Test() {
  return (
    <InputGroup className='max-w-xs'>
      <InputGroupInput placeholder='Search...' />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
    </InputGroup>
  );
}
