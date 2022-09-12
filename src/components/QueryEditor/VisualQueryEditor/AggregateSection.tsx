import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { EditorField, EditorFieldGroup, EditorList, EditorRow } from '@grafana/experimental';
import {
  QueryEditorExpression,
  QueryEditorExpressionType,
  QueryEditorReduceExpression,
} from 'components/LegacyQueryEditor/editor/expressions';
import { AdxDataSource } from 'datasource';
import React, { useState, useEffect } from 'react';
import { AsyncState } from 'react-use/lib/useAsyncFn';
import { AdxColumnSchema, AdxDataSourceOptions, KustoQuery } from 'types';
import { QueryEditorPropertyType } from 'schema/types';
import { sanitizeAggregate } from './utils/utils';
import AggregateItem from './AggregateItem';

type Props = QueryEditorProps<AdxDataSource, KustoQuery, AdxDataSourceOptions>;

interface AggregateSectionProps extends Props {
  tableSchema: AsyncState<AdxColumnSchema[]>;
  database: string;
  templateVariableOptions: SelectableValue<string>;
}

const AggregateSection: React.FC<AggregateSectionProps> = ({
  query,
  datasource,
  tableSchema,
  templateVariableOptions,
  onChange: onQueryChange,
}) => {
  const expressions = query.expression.reduce.expressions;
  const [aggregates, setAggregates] = useState(expressions);

  useEffect(() => {
    if (!aggregates.length && expressions?.length) {
      setAggregates(expressions);
    }
  }, [aggregates.length, expressions]);

  const onChange = (newItems: Array<Partial<QueryEditorReduceExpression>>) => {
    const cleaned = newItems.map(
      (v): QueryEditorReduceExpression => ({
        type: QueryEditorExpressionType.Reduce,
        property: v.property ?? { type: QueryEditorPropertyType.String, name: '' },
        reduce: v.reduce ?? { name: '', type: QueryEditorPropertyType.String },
        parameters: v.parameters,
      })
    );
    setAggregates(cleaned);

    // Only save valid and complete filters into the query state
    const validExpressions: QueryEditorExpression[] = [];
    for (const operatorExpression of cleaned) {
      const validated = sanitizeAggregate(operatorExpression);
      if (validated) {
        validExpressions.push(validated);
      }
    }

    const newExpression = {
      ...query.expression,
      reduce: { ...query.expression.reduce, expressions: validExpressions },
    };
    onQueryChange({
      ...query,
      expression: newExpression,
      query: datasource.parseExpression(newExpression, tableSchema.value),
    });
  };

  return (
    <>
      <EditorRow>
        <EditorFieldGroup>
          <EditorField label="Aggregate" optional={true}>
            <EditorList
              items={aggregates}
              onChange={onChange}
              renderItem={makeRenderAggregate(datasource, query, tableSchema.value, templateVariableOptions)}
            />
          </EditorField>
        </EditorFieldGroup>
      </EditorRow>
    </>
  );
};

// Making component functions in the render body is not recommended, but it works for now.
// If some problems arise (perhaps with state going missing), consider this to be a potential cause
function makeRenderAggregate(
  datasource: AdxDataSource,
  query: KustoQuery,
  columns: AdxColumnSchema[] | undefined,
  templateVariableOptions: SelectableValue<string>
) {
  function renderAggregate(
    item: Partial<QueryEditorExpression>,
    onChange: (item: QueryEditorExpression) => void,
    onDelete: () => void
  ) {
    return (
      <AggregateItem
        datasource={datasource}
        query={query}
        aggregate={item}
        onChange={onChange}
        onDelete={onDelete}
        columns={columns}
        templateVariableOptions={templateVariableOptions}
      />
    );
  }

  return renderAggregate;
}

export default AggregateSection;