import AlertDialog from '../ui/AlertDialog';

/**
 * Re-export AlertDialog as ConfirmDialog for semantic clarity.
 */
export default function ConfirmDialog(props) {
  return <AlertDialog {...props} />;
}
