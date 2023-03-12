import {applyDecorators, Type} from "@nestjs/common";
import {ApiExtraModels, ApiOkResponse, getSchemaPath} from "@nestjs/swagger";
import Page from "./Page.js";

const ApiPaginatedOkResponse = <TModel extends Type<unknown>>({
	type,
	description,
}: {
	type: TModel;
	description?: string;
}) => {
	return applyDecorators(
		ApiExtraModels(Page),
		ApiOkResponse({
			...(description ? {description} : null),
			schema: {
				allOf: [
					{$ref: getSchemaPath(Page)},
					{
						properties: {
							data: {
								type: "array",
								items: {$ref: getSchemaPath(type)},
							},
						},
					},
				],
			},
		})
	);
};

export default ApiPaginatedOkResponse;
