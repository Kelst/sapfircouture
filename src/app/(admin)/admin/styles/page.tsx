import { getStyles } from "@/actions/style.actions";
import { StylesManager } from "./styles-manager";

export default async function StylesPage() {
  const styles = await getStyles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Styles</h1>
        <p className="text-muted-foreground">
          Manage dress styles that can be assigned to dresses
        </p>
      </div>

      <StylesManager initialStyles={styles} />
    </div>
  );
}
