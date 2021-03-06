package remotecli

import (
	"fmt"
	"strconv"
)

func (c *remoteCli) cmdDefaultTimeout(args []string) (string, error) {
	sto := ""
	if len(args) != 0 {
		sto = args[0]
		if sto == "" {
			c.UnsetDefaultTimeout()
			return fmt.Sprint("Unset default timeout"), nil
		}
		t, err := strconv.ParseInt(sto, 10, 64)
		if err != nil || t <= 0 {
			return "", fmt.Errorf("%s is not integer or is negative", sto)
		}
		c.SetDefaultTimeout(int(t))
	}

	return fmt.Sprintf("Default timeout: %d", c.GetDefaultTimeout()), nil
}
