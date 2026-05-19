import { JSX } from 'react';
import { Light as ReactSyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { dracula, docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { useTheme } from '@/contexts/ThemeContext';

ReactSyntaxHighlighter.registerLanguage('json', json);

/**
 * A wrapper around ReactSyntaxHighlighter to apply a consistent style across the app.
 * @param props Props to pass to the ReactSyntaxHighlighter component.
 * @returns JSX.Element
 */
const SyntaxHighlighter = (props: React.ComponentProps<typeof ReactSyntaxHighlighter>): JSX.Element => {
  const { theme } = useTheme();
  const style = theme === 'dark' ? dracula : docco;

  return <ReactSyntaxHighlighter style={style} {...props} />;
};

export default SyntaxHighlighter;
