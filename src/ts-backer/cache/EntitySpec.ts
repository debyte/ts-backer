import EntityFieldSpec from "./EntityFieldSpec";
import EntityIndexSpec from "./EntityIndexSpec";
import Timed from "./Timed";

interface EntitySpec extends Timed {
  name: string;
  fields: EntityFieldSpec[];
  indexes: EntityIndexSpec[];
}

export default EntitySpec;
