import { transformPipelineData } from "../../src/helpers/pipeline";

test('transformPipelineData should transform the pipeline data', () => {
const pipeline = [{elements: [{ elements: [{elements: [],id: '1',name: 'test',type: 'mapper',}, ], id: '2', name: 'test', type: 'mapper',},],id: '3',name: 'test',type: 'mapper',},]
const result = transformPipelineData(pipeline);
expect(result).toEqual({"elementsData": {"1": {"id": "3", "name": "test", "type": "mapper"}, "111": {"id": "2", "name": "test", "type": "mapper"}, "1211": {"id": "1", "name": "test", "type": "mapper"}}, "pipeline": [[1, [[111, [[1211, []]]]]]]});
});

