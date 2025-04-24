import Timed from "../cache/Timed";
import EntityFieldSpec from "./EntityFieldSpec";
import EntityIndexSpec from "./EntityIndexSpec";

interface EntitySpec extends Timed {
  name: string;
  path: string;
  fields: EntityFieldSpec[];
  indexes: EntityIndexSpec[];
}

export default EntitySpec;
