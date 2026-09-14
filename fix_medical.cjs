const fs = require('fs');
let content = fs.readFileSync('src/components/MedicalScreening.tsx', 'utf-8');

content = content.replace(
  /                              \{\/\* Metrics \*\/\}\n                              <div \/>\n                            <\/div>\n                          <\/div>\n                  <\/>/,
`                              {/* Metrics */}
                              <div />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>`
);

fs.writeFileSync('src/components/MedicalScreening.tsx', content);
