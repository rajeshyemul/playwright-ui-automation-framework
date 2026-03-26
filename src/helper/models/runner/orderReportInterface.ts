export interface JsonReport {
  suites?: JsonSuite[];
  stats?: {
    duration?: number;
  };
}

export interface JsonSuite {
  title: string;
  file?: string;
  line?: number;
  column?: number;
  specs?: JsonSpec[];
  suites?: JsonSuite[];
}

export interface JsonSpec {
  id: string;
  title: string;
  file: string;
  line: number;
  column: number;
  tags?: string[];
  tests: JsonTestEntry[];
}

export interface JsonTestEntry {
  status: string;
  results: JsonTestResult[];
}

export interface JsonTestResult {
  status: string;
  duration: number;
  error?: {
    message?: string;
    value?: string;
  };
  errors?: Array<{
    message?: string;
    value?: string;
  }>;
}