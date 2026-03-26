const PRIORITY_TAGS = new Set(['@P1', '@P2', '@P3', '@P4']);
const RUN_FIRST_TAG = '@runFirst';
const RUN_LAST_TAG = '@runLast';

function getPropertyName(property) {
  if (!property || property.type !== 'Property') {
    return null;
  }

  if (property.key.type === 'Identifier') {
    return property.key.name;
  }

  if (property.key.type === 'Literal' && typeof property.key.value === 'string') {
    return property.key.value;
  }

  return null;
}

function getStaticStringValue(node) {
  if (!node) {
    return null;
  }

  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }

  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0]?.value?.cooked ?? null;
  }

  return null;
}

function getTags(configNode) {
  if (!configNode || configNode.type !== 'ObjectExpression') {
    return [];
  }

  const tagProperty = configNode.properties.find((property) => getPropertyName(property) === 'tag');
  if (!tagProperty || tagProperty.type !== 'Property') {
    return [];
  }

  const valueNode = tagProperty.value;
  if (!valueNode || valueNode.type !== 'ArrayExpression') {
    return [];
  }

  return valueNode.elements
    .map((element) => getStaticStringValue(element))
    .filter((value) => typeof value === 'string');
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate Playwright test priority tags',
    },
    schema: [],
  },

  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'test') {
          return;
        }

        const configNode = node.arguments[1];
        const tags = getTags(configNode);

        const priorityTags = tags.filter((tag) => PRIORITY_TAGS.has(tag));
        const hasRunFirst = tags.includes(RUN_FIRST_TAG);
        const hasRunLast = tags.includes(RUN_LAST_TAG);
        const reportNode = configNode && configNode.type === 'ObjectExpression' ? configNode : node;

        if (priorityTags.length > 1) {
          context.report({
            node: reportNode,
            message: `Only one priority tag allowed. Found: ${priorityTags.join(', ')}.`,
          });
        }

        if (hasRunFirst && hasRunLast) {
          context.report({
            node: reportNode,
            message: 'Cannot use both @runFirst and @runLast.',
          });
        }
      },
    };
  },
};
