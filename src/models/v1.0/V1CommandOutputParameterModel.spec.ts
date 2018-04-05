import {testCommandOutputBindingSerialization} from '../../tests/shared/model';
import {V1CommandLineToolModel} from './V1CommandLineToolModel';

describe("V1CommandOutputParameterModel", () => {
    testCommandOutputBindingSerialization(V1CommandLineToolModel);
});