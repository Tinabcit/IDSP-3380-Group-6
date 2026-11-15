import { useStat, useEffect } from "react";
import { Search } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function SearchBar() {
  return (
    <InputGroup className='max-w-xs'>
      <InputGroupInput placeholder='Search...' />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupAddon align='inline-end'>12 results</InputGroupAddon>
    </InputGroup>
  );
}
