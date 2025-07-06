import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, FileSpreadsheet, FileJson, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ExportJournal() {
  const [selectedFormat, setSelectedFormat] = useState<string>('json');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const formatOptions = [
    { value: 'json', label: 'JSON', icon: FileJson, description: 'Structured data format' },
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Spreadsheet format' },
    { value: 'txt', label: 'Text', icon: FileText, description: 'Plain text format' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/entries/export?format=${selectedFormat}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const filename = `journal-entries.${selectedFormat}`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Journal entries exported as ${selectedFormat.toUpperCase()} file`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export journal entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const selectedFormatData = formatOptions.find(f => f.value === selectedFormat);

  return (
    <Card className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Journal
        </CardTitle>
        <p className="text-sm text-gray-200 dark:text-gray-300">
          Download your journal entries in different formats
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Export Format</label>
          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger className="bg-white/20 dark:bg-gray-800/20 border-white/30 dark:border-gray-600/30 text-white">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  <div className="flex items-center gap-2">
                    <format.icon className="w-4 h-4" />
                    <span>{format.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedFormatData && (
          <div className="bg-white/10 dark:bg-gray-800/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <selectedFormatData.icon className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">{selectedFormatData.label} Format</span>
            </div>
            <p className="text-xs text-gray-300 dark:text-gray-400">
              {selectedFormatData.description}
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs border-white/30 text-white">
                {selectedFormat === 'json' && 'Includes all data and AI insights'}
                {selectedFormat === 'csv' && 'Spreadsheet compatible with Excel'}
                {selectedFormat === 'txt' && 'Human-readable text format'}
              </Badge>
            </div>
          </div>
        )}

        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Journal
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}