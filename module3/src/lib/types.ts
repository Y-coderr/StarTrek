export interface QueryItem {
        reqquery: string;
        response: string;
        timestamp: number;
        language: string;
      }
      
      export interface QueryGroup {
        [date: string]: {
          [key: string]: QueryItem;
        };
      }